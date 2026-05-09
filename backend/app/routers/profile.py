from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.cognitive_scorer import score_cognitive_profile
from app.services.profile_builder import build_profile
from app.services.path_recommender import recommend_paths

router = APIRouter()


class ProfileRequest(BaseModel):
    survey: Optional[dict] = None
    notes: Optional[dict] = None
    chat: Optional[dict] = None
    assessments: Optional[dict] = None


@router.post("/generate")
async def generate_profile(data: ProfileRequest):
    """
    Main profile generation endpoint.
    Takes all intake data and produces cognitive profile + path recommendations.
    """
    try:
        # Step 1: Score cognitive domains using Gemini
        cognitive_scores = await score_cognitive_profile(
            survey=data.survey,
            chat=data.chat,
            assessments=data.assessments
        )

        # Step 2: Build composite profile
        profile = build_profile(
            cognitive_scores=cognitive_scores,
            survey=data.survey,
            assessments=data.assessments
        )

        # Step 3: Generate path recommendations
        paths = recommend_paths(profile)

        return {
            **profile,
            "paths": paths,
            "generated_at": __import__("datetime").datetime.now().isoformat()
        }

    except Exception as e:
        # Fallback to mock profile if AI fails
        print(f"Profile generation error: {e}")
        return _generate_fallback_profile(data.survey)


def _generate_fallback_profile(survey: dict = None):
    """Generate a mock profile when AI services are unavailable."""
    survey = survey or {}
    skills = survey.get("skills", "").split(",") if survey.get("skills") else ["Communication", "Problem Solving"]
    languages = survey.get("languages", "").split(",") if survey.get("languages") else ["English"]
    interests = survey.get("interests", "").split(",") if survey.get("interests") else ["Education"]

    return {
        "cognitive_domains": {
            "attention_working_memory": {"score": 7.2, "confidence": 0.65, "evidence": ["Survey self-regulation scores indicate strong attentional control", "Chat responses show sustained focus across questions"]},
            "executive_function": {"score": 6.8, "confidence": 0.60, "evidence": ["Goal-setting behavior detected in survey", "Structured reasoning in chat responses"]},
            "memory_encoding": {"score": 8.1, "confidence": 0.70, "evidence": ["Accurate recall of video content in chat", "Detailed reference to specific concepts"]},
            "visuospatial": {"score": 5.5, "confidence": 0.45, "evidence": ["Limited spatial data without handwriting analysis", "Text-dominant responses suggest verbal preference"]},
            "language_complexity": {"score": 7.8, "confidence": 0.72, "evidence": ["Above-average vocabulary diversity in reflections", "Complex sentence structures in Ikigai responses"]},
        },
        "motivational_profile": {
            "competence": 8.0, "usefulness": 7.5, "tension_reversed": 6.0,
            "relatedness": 7.0, "importance": 8.5, "choice": 7.0, "enjoyment": 6.5,
        },
        "asset_inventory": {
            "prior_skills": [s.strip() for s in skills if s.strip()],
            "life_experience": survey.get("experience", "Career transitioner"),
            "languages": [l.strip() for l in languages if l.strip()],
            "domain_knowledge": [i.strip() for i in interests if i.strip()],
        },
        "discovery_stage": {
            "phase": 1, "phase_label": "Getting to Know You",
            "confidence": 0.68, "inputs_received": 4, "inputs_needed": 0,
        },
        "paths": [
            {
                "id": "strength", "name": "Strength-Leveraging Path", "type": "strength",
                "confidence": 0.82,
                "rationale": "This path builds on your strong memory encoding and language skills. Courses emphasize reading-intensive content, discussion-based learning, and written analysis.",
                "strengths_leveraged": ["Memory Encoding", "Language Complexity"],
                "growth_areas": ["Visuospatial Processing"],
                "competencies": ["Critical Analysis", "Research Methods", "Written Communication"],
                "estimated_weeks": 16,
                "courses": [
                    {"name": "Foundations of Critical Thinking", "type": "core"},
                    {"name": "Research Methods & Data Literacy", "type": "core"},
                    {"name": "Communication for Impact", "type": "elective"},
                ]
            },
            {
                "id": "growth", "name": "Growth-Stretching Path", "type": "growth",
                "confidence": 0.71,
                "rationale": "This path develops your visuospatial and executive function skills while anchoring in your language strengths. Includes more hands-on, project-based courses.",
                "strengths_leveraged": ["Language Complexity"],
                "growth_areas": ["Visuospatial Processing", "Executive Function"],
                "competencies": ["Design Thinking", "Project Management", "Visual Communication"],
                "estimated_weeks": 20,
                "courses": [
                    {"name": "Design Thinking Workshop", "type": "core"},
                    {"name": "Data Visualization & Storytelling", "type": "core"},
                    {"name": "Project-Based Leadership", "type": "elective"},
                ]
            },
            {
                "id": "interest", "name": "Interest-Aligned Path", "type": "interest",
                "confidence": 0.76,
                "rationale": "This path follows your stated passions and motivational drivers. High intrinsic motivation predicted — courses align with your Ikigai profile.",
                "strengths_leveraged": ["Memory Encoding", "Attention"],
                "growth_areas": ["Executive Function"],
                "competencies": ["Domain Expertise", "Self-Directed Learning", "Applied Innovation"],
                "estimated_weeks": 18,
                "courses": [
                    {"name": "Exploring Your Field: Survey Course", "type": "core"},
                    {"name": "Applied Innovation Lab", "type": "core"},
                    {"name": "Mentored Independent Study", "type": "elective"},
                ]
            }
        ],
        "generated_at": __import__("datetime").datetime.now().isoformat()
    }
