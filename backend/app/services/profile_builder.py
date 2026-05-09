"""
Profile Builder Service
Constructs the complete learner profile from cognitive scores, survey data, and assessments.

This service:
1. Takes raw cognitive domain scores from the scorer
2. Adjusts confidence based on input quality/quantity
3. Builds the asset inventory from survey data
4. Computes the discovery stage status
"""


def build_profile(
    cognitive_scores: dict,
    survey: dict = None,
    assessments: dict = None,
) -> dict:
    """Build the complete learner profile."""

    # Extract scores from Gemini output
    domains = cognitive_scores.get("cognitive_domains", {})
    motivation = cognitive_scores.get("motivational_profile", {})

    # Build asset inventory from survey
    asset_inventory = _build_asset_inventory(survey)

    # Compute overall confidence
    domain_confidences = [d.get("confidence", 0.5) for d in domains.values()]
    overall_confidence = sum(domain_confidences) / len(domain_confidences) if domain_confidences else 0.5

    # Adjust confidence based on inputs received
    inputs_received = sum([
        1 if survey else 0,
        1 if assessments else 0,
        1,  # chat (always present at this point)
        # handwriting would be a 4th input
    ])
    confidence_boost = inputs_received * 0.05
    overall_confidence = min(0.95, overall_confidence + confidence_boost)

    return {
        "cognitive_domains": domains,
        "motivational_profile": motivation,
        "asset_inventory": asset_inventory,
        "discovery_stage": {
            "phase": 1,
            "phase_label": "Getting to Know You",
            "confidence": round(overall_confidence, 2),
            "inputs_received": inputs_received,
            "inputs_needed": max(0, 4 - inputs_received),
        }
    }


def _build_asset_inventory(survey: dict) -> dict:
    """Extract assets from survey data — strengths-first per ABCD philosophy."""
    if not survey:
        return {
            "prior_skills": [],
            "life_experience": "",
            "languages": ["English"],
            "domain_knowledge": [],
        }

    skills = [s.strip() for s in survey.get("skills", "").split(",") if s.strip()]
    languages = [l.strip() for l in survey.get("languages", "").split(",") if l.strip()]
    interests = [i.strip() for i in survey.get("interests", "").split(",") if i.strip()]

    return {
        "prior_skills": skills if skills else ["Self-directed learning"],
        "life_experience": survey.get("experience", ""),
        "languages": languages if languages else ["English"],
        "domain_knowledge": interests if interests else ["General"],
    }
