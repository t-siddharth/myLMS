"""
Path Recommender Service — AI Curriculum Architect

Generates 3 personalized learning path recommendations based on the learner's profile:
1. Strength-Leveraging Path — builds on top cognitive strengths
2. Growth-Stretching Path — develops weaker domains while anchoring in strengths
3. Interest-Aligned Path — follows motivational/Ikigai drivers regardless of cognitive fit

Future: Uses contextual bandits (Thompson Sampling) for exploration vs. exploitation.
For MVP: Rule-based recommendation with confidence scoring.
"""


# Mock course catalog (MVP — replace with DB)
COURSE_CATALOG = [
    {"id": "CT101", "name": "Foundations of Critical Thinking", "type": "core",
     "cognitive_demand": {"language_complexity": 8, "executive_function": 6, "memory_encoding": 7, "attention_working_memory": 5, "visuospatial": 2},
     "cutrice_fit": {"competence": 8, "importance": 7, "choice": 6},
     "competencies": ["Critical Analysis", "Logical Reasoning"]},

    {"id": "RM201", "name": "Research Methods & Data Literacy", "type": "core",
     "cognitive_demand": {"executive_function": 8, "memory_encoding": 7, "language_complexity": 6, "attention_working_memory": 7, "visuospatial": 5},
     "cutrice_fit": {"competence": 9, "usefulness": 8},
     "competencies": ["Research Methods", "Data Literacy", "Statistical Thinking"]},

    {"id": "CI301", "name": "Communication for Impact", "type": "elective",
     "cognitive_demand": {"language_complexity": 9, "memory_encoding": 5, "executive_function": 5, "attention_working_memory": 4, "visuospatial": 3},
     "cutrice_fit": {"relatedness": 8, "enjoyment": 7},
     "competencies": ["Written Communication", "Public Speaking", "Persuasion"]},

    {"id": "DT102", "name": "Design Thinking Workshop", "type": "core",
     "cognitive_demand": {"visuospatial": 8, "executive_function": 7, "language_complexity": 4, "memory_encoding": 4, "attention_working_memory": 5},
     "cutrice_fit": {"enjoyment": 9, "choice": 8},
     "competencies": ["Design Thinking", "Creative Problem Solving", "Prototyping"]},

    {"id": "DV202", "name": "Data Visualization & Storytelling", "type": "core",
     "cognitive_demand": {"visuospatial": 9, "language_complexity": 6, "executive_function": 6, "memory_encoding": 4, "attention_working_memory": 5},
     "cutrice_fit": {"competence": 7, "usefulness": 9},
     "competencies": ["Visual Communication", "Data Storytelling", "Chart Design"]},

    {"id": "PL302", "name": "Project-Based Leadership", "type": "elective",
     "cognitive_demand": {"executive_function": 9, "language_complexity": 6, "attention_working_memory": 7, "memory_encoding": 5, "visuospatial": 3},
     "cutrice_fit": {"relatedness": 9, "importance": 8},
     "competencies": ["Project Management", "Team Leadership", "Strategic Planning"]},

    {"id": "EF103", "name": "Exploring Your Field: Survey Course", "type": "core",
     "cognitive_demand": {"memory_encoding": 7, "language_complexity": 6, "attention_working_memory": 6, "executive_function": 4, "visuospatial": 3},
     "cutrice_fit": {"choice": 9, "enjoyment": 8, "importance": 7},
     "competencies": ["Domain Exploration", "Self-Discovery", "Field Knowledge"]},

    {"id": "AI203", "name": "Applied Innovation Lab", "type": "core",
     "cognitive_demand": {"executive_function": 8, "visuospatial": 6, "language_complexity": 5, "memory_encoding": 5, "attention_working_memory": 7},
     "cutrice_fit": {"competence": 8, "enjoyment": 9, "choice": 8},
     "competencies": ["Applied Innovation", "Experimentation", "Iterative Design"]},

    {"id": "MI303", "name": "Mentored Independent Study", "type": "elective",
     "cognitive_demand": {"executive_function": 7, "language_complexity": 7, "memory_encoding": 6, "attention_working_memory": 6, "visuospatial": 4},
     "cutrice_fit": {"choice": 10, "importance": 9, "competence": 7},
     "competencies": ["Self-Directed Learning", "Research Skills", "Subject Mastery"]},
]


def recommend_paths(profile: dict) -> list:
    """
    Generate 3 path recommendations based on the learner's profile.
    """
    domains = profile.get("cognitive_domains", {})
    motivation = profile.get("motivational_profile", {})

    # Sort domains by score
    domain_scores = {k: v.get("score", 5) if isinstance(v, dict) else v for k, v in domains.items()}
    sorted_domains = sorted(domain_scores.items(), key=lambda x: x[1], reverse=True)

    top_strengths = [d[0] for d in sorted_domains[:2]]
    growth_areas = [d[0] for d in sorted_domains[-2:]]

    # Path 1: Strength-Leveraging
    strength_courses = _select_courses_for_strengths(top_strengths, COURSE_CATALOG)
    strength_confidence = _compute_path_confidence(strength_courses, domain_scores, "strength")

    # Path 2: Growth-Stretching
    growth_courses = _select_courses_for_growth(growth_areas, top_strengths, COURSE_CATALOG)
    growth_confidence = _compute_path_confidence(growth_courses, domain_scores, "growth")

    # Path 3: Interest-Aligned
    interest_courses = _select_courses_for_interest(motivation, COURSE_CATALOG)
    interest_confidence = _compute_path_confidence(interest_courses, domain_scores, "interest")

    domain_labels = {
        "attention_working_memory": "Attention & Working Memory",
        "executive_function": "Executive Function",
        "memory_encoding": "Memory Encoding",
        "visuospatial": "Visuospatial Processing",
        "language_complexity": "Language Complexity",
    }

    return [
        {
            "id": "strength",
            "name": "Strength-Leveraging Path",
            "type": "strength",
            "confidence": round(strength_confidence, 2),
            "rationale": f"This path builds on your strongest domains: {', '.join(domain_labels.get(s, s) for s in top_strengths)}. Courses emphasize activities where you'll naturally excel and build confidence.",
            "strengths_leveraged": [domain_labels.get(s, s) for s in top_strengths],
            "growth_areas": [domain_labels.get(g, g) for g in growth_areas[:1]],
            "competencies": list(set(c for course in strength_courses for c in course["competencies"]))[:4],
            "estimated_weeks": len(strength_courses) * 6,
            "courses": [{"name": c["name"], "type": c["type"]} for c in strength_courses],
        },
        {
            "id": "growth",
            "name": "Growth-Stretching Path",
            "type": "growth",
            "confidence": round(growth_confidence, 2),
            "rationale": f"This path develops your {', '.join(domain_labels.get(g, g) for g in growth_areas)} while anchoring in your {domain_labels.get(top_strengths[0], top_strengths[0])} strengths. More challenge, more growth.",
            "strengths_leveraged": [domain_labels.get(top_strengths[0], top_strengths[0])],
            "growth_areas": [domain_labels.get(g, g) for g in growth_areas],
            "competencies": list(set(c for course in growth_courses for c in course["competencies"]))[:4],
            "estimated_weeks": len(growth_courses) * 7,
            "courses": [{"name": c["name"], "type": c["type"]} for c in growth_courses],
        },
        {
            "id": "interest",
            "name": "Interest-Aligned Path",
            "type": "interest",
            "confidence": round(interest_confidence, 2),
            "rationale": "This path follows your passions and motivational drivers. High intrinsic motivation predicted — courses align with what matters most to you.",
            "strengths_leveraged": [domain_labels.get(top_strengths[0], top_strengths[0])],
            "growth_areas": [domain_labels.get(growth_areas[0], growth_areas[0])],
            "competencies": list(set(c for course in interest_courses for c in course["competencies"]))[:4],
            "estimated_weeks": len(interest_courses) * 6,
            "courses": [{"name": c["name"], "type": c["type"]} for c in interest_courses],
        },
    ]


def _select_courses_for_strengths(strengths: list, catalog: list) -> list:
    """Select courses that align with the learner's top cognitive strengths."""
    scored = []
    for course in catalog:
        demand = course["cognitive_demand"]
        score = sum(demand.get(s, 0) for s in strengths)
        scored.append((score, course))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [c for _, c in scored[:3]]


def _select_courses_for_growth(growth_areas: list, anchors: list, catalog: list) -> list:
    """Select courses that develop growth areas while including anchor strengths."""
    scored = []
    for course in catalog:
        demand = course["cognitive_demand"]
        growth_score = sum(demand.get(g, 0) for g in growth_areas)
        anchor_score = sum(demand.get(a, 0) for a in anchors) * 0.3
        scored.append((growth_score + anchor_score, course))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [c for _, c in scored[:3]]


def _select_courses_for_interest(motivation: dict, catalog: list) -> list:
    """Select courses that match motivational profile (CUTRICE)."""
    scored = []
    for course in catalog:
        fit = course.get("cutrice_fit", {})
        score = sum(min(motivation.get(k, 5), 10) * v for k, v in fit.items())
        scored.append((score, course))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [c for _, c in scored[:3]]


def _compute_path_confidence(courses: list, domain_scores: dict, path_type: str) -> float:
    """Compute confidence score for a path recommendation."""
    if not courses:
        return 0.5

    # Base confidence from domain data quality
    avg_score = sum(domain_scores.values()) / len(domain_scores) if domain_scores else 5
    base = 0.6 + (avg_score / 10) * 0.2

    # Adjust by path type
    if path_type == "strength":
        base += 0.05  # Higher confidence when leveraging strengths
    elif path_type == "growth":
        base -= 0.05  # Slightly lower — more uncertainty in growth predictions
    elif path_type == "interest":
        base += 0.02  # Moderate — motivation data is self-reported

    return min(0.95, max(0.4, base))
