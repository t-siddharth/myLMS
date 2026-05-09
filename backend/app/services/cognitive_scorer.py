"""
Cognitive Scorer Service
Uses Gemini to analyze all intake data and produce structured cognitive domain scores.

This is the core AI engine of NeuroCog. It takes survey responses, chat transcripts,
handwriting analysis, and micro-assessment results, then uses Gemini to produce
scores across the 5 cognitive domains + CUTRICE motivational dimensions.

Scientific basis: Domain-based cognitive profiling (Andújar-Castillo et al.)
adapted from neuropsychological assessment to informal educational inputs.
"""

import os
import json
import google.generativeai as genai


SCORING_PROMPT = """You are a cognitive profiling AI for an educational system called NeuroCog.
You analyze student intake data to produce a multidimensional cognitive profile.

You will receive intake data from a learner including:
- Survey responses (demographics, goals, Ikigai reflections, self-regulation questionnaire)
- AI chat transcript (5 questions: recall, comprehension, application, analysis, creation)
- Micro-assessment results (Stroop task, digit span)

YOUR TASK: Analyze ALL inputs and produce scores for 5 cognitive domains and 7 motivational dimensions.

## Cognitive Domains (score 1-10, with evidence)

1. **Attention & Working Memory**: Ability to sustain focus and hold information in mind
   - Signals: self-regulation items about focus, Stroop accuracy, digit span forward, chat response consistency
   
2. **Executive Function**: Planning, organizing, cognitive flexibility, inhibition
   - Signals: goal-setting behavior, self-regulation items about strategy adjustment, Stroop interference effect, chat analysis/creation quality
   
3. **Memory Encoding**: Ability to encode and retrieve information
   - Signals: recall accuracy in chat, digit span performance, content accuracy in responses
   
4. **Visuospatial Processing**: Spatial reasoning and visual information processing
   - Signals: (limited without handwriting) — look for spatial language in responses, diagram/visual references
   
5. **Language Complexity**: Vocabulary, sentence structure, verbal reasoning
   - Signals: vocabulary diversity in Ikigai reflections and chat, sentence complexity, use of domain-specific terms

## Motivational Profile (CUTRICE, score 1-10)

Score these from the Ikigai reflections and self-regulation responses:
- **Competence**: Need for mastery and feeling effective
- **Usefulness**: Need for practical, applicable outcomes
- **Tension (reversed)**: Comfort with productive struggle/challenge
- **Relatedness**: Need for social connection and collaboration
- **Importance**: Sense of personal significance and meaning
- **Choice**: Need for autonomy and self-direction
- **Enjoyment**: Intrinsic pleasure in learning activities

## Output Format

Return ONLY a valid JSON object:
{
  "cognitive_domains": {
    "attention_working_memory": {"score": <1-10>, "confidence": <0-1>, "evidence": ["<evidence1>", "<evidence2>"]},
    "executive_function": {"score": <1-10>, "confidence": <0-1>, "evidence": ["<evidence1>", "<evidence2>"]},
    "memory_encoding": {"score": <1-10>, "confidence": <0-1>, "evidence": ["<evidence1>", "<evidence2>"]},
    "visuospatial": {"score": <1-10>, "confidence": <0-1>, "evidence": ["<evidence1>", "<evidence2>"]},
    "language_complexity": {"score": <1-10>, "confidence": <0-1>, "evidence": ["<evidence1>", "<evidence2>"]}
  },
  "motivational_profile": {
    "competence": <1-10>,
    "usefulness": <1-10>,
    "tension_reversed": <1-10>,
    "relatedness": <1-10>,
    "importance": <1-10>,
    "choice": <1-10>,
    "enjoyment": <1-10>
  }
}

IMPORTANT RULES:
- Be honest about confidence levels. If you have limited data for a domain, set confidence lower.
- Base evidence on ACTUAL data from the inputs, not assumptions.
- Visuospatial will typically have lower confidence without handwriting data.
- Every evidence string must reference specific learner input.
- Scores should show realistic variance — not everyone is a 7 across the board.
- Asset-based framing: describe strengths positively, growth areas as opportunities, NEVER as deficits.

Return ONLY valid JSON, no markdown formatting."""


async def score_cognitive_profile(
    survey: dict = None,
    chat: dict = None,
    assessments: dict = None,
    handwriting_analysis: dict = None,
) -> dict:
    """
    Use Gemini to analyze all intake data and produce cognitive domain scores.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise Exception("GEMINI_API_KEY not set")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    # Compile all learner data into a structured context
    learner_data = _compile_learner_context(survey, chat, assessments, handwriting_analysis)

    try:
        response = model.generate_content([
            SCORING_PROMPT,
            f"\n\n## LEARNER DATA:\n{json.dumps(learner_data, indent=2)}"
        ])

        # Parse JSON from response
        text = response.text.strip()
        # Handle markdown code blocks
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        result = json.loads(text)
        return result

    except (json.JSONDecodeError, Exception) as e:
        print(f"Gemini scoring failed: {e}")
        return _fallback_scores()


def _compile_learner_context(survey, chat, assessments, handwriting) -> dict:
    """Compile all inputs into a single context dict for the LLM."""
    context = {}

    if survey:
        context["survey"] = {
            "demographics": {
                "name": survey.get("name", ""),
                "age": survey.get("age", ""),
                "education": survey.get("education_level", ""),
                "transition_type": survey.get("transition_type", ""),
            },
            "goals": survey.get("goals", ""),
            "interests": survey.get("interests", ""),
            "skills": survey.get("skills", ""),
            "languages": survey.get("languages", ""),
            "experience": survey.get("experience", ""),
            "ikigai_reflections": survey.get("ikigai", {}),
            "self_regulation_scores": survey.get("self_regulation", {}),
        }

    if chat:
        context["chat_responses"] = {
            "recall_response": chat.get("recall", ""),
            "comprehension_response": chat.get("comprehension", ""),
            "application_response": chat.get("application", ""),
            "analysis_response": chat.get("analysis", ""),
            "creation_response": chat.get("creation", ""),
        }

    if assessments:
        stroop = assessments.get("stroop", {})
        digit = assessments.get("digit_span", {})
        context["micro_assessments"] = {
            "stroop": {
                "accuracy": stroop.get("accuracy", 0),
                "avg_reaction_time_ms": stroop.get("avgReactionTime", 0),
                "congruent_accuracy": stroop.get("congruentAccuracy", 0),
                "incongruent_accuracy": stroop.get("incongruentAccuracy", 0),
            },
            "digit_span": {
                "forward_max": digit.get("forward_max", 0),
                "backward_max": digit.get("backward_max", 0),
            }
        }

    if handwriting:
        context["handwriting_analysis"] = handwriting

    return context


def _fallback_scores() -> dict:
    """Return moderate fallback scores when Gemini is unavailable."""
    return {
        "cognitive_domains": {
            "attention_working_memory": {"score": 6.5, "confidence": 0.4, "evidence": ["Insufficient data for confident scoring"]},
            "executive_function": {"score": 6.0, "confidence": 0.4, "evidence": ["Insufficient data for confident scoring"]},
            "memory_encoding": {"score": 7.0, "confidence": 0.4, "evidence": ["Insufficient data for confident scoring"]},
            "visuospatial": {"score": 5.0, "confidence": 0.3, "evidence": ["No visual input data available"]},
            "language_complexity": {"score": 6.5, "confidence": 0.4, "evidence": ["Insufficient data for confident scoring"]},
        },
        "motivational_profile": {
            "competence": 6.0, "usefulness": 6.0, "tension_reversed": 5.0,
            "relatedness": 6.0, "importance": 6.0, "choice": 6.0, "enjoyment": 6.0,
        }
    }
