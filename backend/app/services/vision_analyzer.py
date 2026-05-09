"""
Vision Analyzer Service
Handles handwriting image analysis via Google Cloud Vision API.

Pipeline Decision (documented in response_to_comments.md):
- Stage 1: Google Vision API for OCR + spatial coordinate extraction
- Stage 2: LLM analysis for cognitive domain scoring (handled by cognitive_scorer.py)

Why Vision API:
1. Best-in-class handwriting OCR
2. Returns spatial coordinates for every text block (needed for visuospatial analysis)
3. Team is already on Google Cloud stack
"""

import os

try:
    from google.cloud import vision
    VISION_AVAILABLE = True
except ImportError:
    VISION_AVAILABLE = False
    print("google-cloud-vision not installed. Using Gemini multimodal fallback for handwriting analysis.")



async def analyze_handwriting(image_b64: str) -> dict:
    """
    Analyze a handwriting image using Google Vision API.
    Returns structured data about text content and spatial layout.
    """
    if not VISION_AVAILABLE:
        return await _gemini_fallback_analysis(image_b64)

    try:
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=__import__("base64").b64decode(image_b64))

        # Full document text detection (best for handwriting)
        response = client.document_text_detection(image=image)

        if response.error.message:
            raise Exception(f"Vision API error: {response.error.message}")

        # Extract text blocks with spatial coordinates
        text_blocks = []
        if response.full_text_annotation:
            for page in response.full_text_annotation.pages:
                for block in page.blocks:
                    block_text = ""
                    for paragraph in block.paragraphs:
                        for word in paragraph.words:
                            word_text = "".join([s.text for s in word.symbols])
                            block_text += word_text + " "

                    vertices = block.bounding_box.vertices
                    text_blocks.append({
                        "text": block_text.strip(),
                        "x": vertices[0].x,
                        "y": vertices[0].y,
                        "width": vertices[2].x - vertices[0].x,
                        "height": vertices[2].y - vertices[0].y,
                        "confidence": block.confidence if hasattr(block, 'confidence') else 0.8,
                    })

        full_text = response.full_text_annotation.text if response.full_text_annotation else ""

        # Structural analysis from spatial data
        structural = _analyze_structure(text_blocks, full_text)
        text_metrics = _compute_text_metrics(full_text)

        return {
            "text_blocks": text_blocks,
            "full_text": full_text,
            "structural_analysis": structural,
            "text_metrics": text_metrics,
            "confidence": 0.85,
            "source": "vision_api"
        }

    except Exception as e:
        print(f"Vision API failed: {e}. Using Gemini-only fallback.")
        return await _gemini_fallback_analysis(image_b64)


async def _gemini_fallback_analysis(image_b64: str) -> dict:
    """Fallback: use Gemini multimodal to analyze the image directly."""
    import google.generativeai as genai

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise Exception("No GEMINI_API_KEY set")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = """Analyze this handwritten note image. Return a JSON object with:
{
  "full_text": "transcribed text from the notes",
  "structural_analysis": {
    "hierarchical_levels": <number of organizational levels: headers, bullets, sub-bullets>,
    "has_bullet_points": <true/false>,
    "has_numbering": <true/false>,
    "has_headers": <true/false>,
    "spatial_organization": "<linear/columnar/clustered/mind-map>",
    "diagram_count": <number of diagrams/drawings>,
    "arrow_count": <number of arrows or connecting lines>,
    "annotation_count": <number of underlines, circles, stars, emphasis marks>
  },
  "text_metrics": {
    "total_words": <count>,
    "estimated_unique_words": <count>,
    "type_token_ratio": <unique/total ratio>,
    "avg_sentence_length": <average words per sentence>,
    "complexity_notes": "<brief note on vocabulary complexity>"
  }
}
Return ONLY valid JSON, no markdown."""

    image_data = __import__("base64").b64decode(image_b64)

    response = model.generate_content([
        prompt,
        {"mime_type": "image/jpeg", "data": image_data}
    ])

    import json
    try:
        result = json.loads(response.text.strip())
        result["confidence"] = 0.70
        result["source"] = "gemini_multimodal"
        if "text_blocks" not in result:
            result["text_blocks"] = []
        return result
    except json.JSONDecodeError:
        # Parse what we can
        return {
            "full_text": response.text[:500],
            "text_blocks": [],
            "structural_analysis": {
                "hierarchical_levels": 1,
                "has_bullet_points": False,
                "has_numbering": False,
                "has_headers": False,
                "spatial_organization": "unknown",
                "diagram_count": 0,
                "arrow_count": 0,
            },
            "text_metrics": {"total_words": 0, "unique_words": 0, "type_token_ratio": 0},
            "confidence": 0.3,
            "source": "gemini_fallback_partial"
        }


def _analyze_structure(blocks: list, text: str) -> dict:
    """Infer structural properties from text block positions."""
    if not blocks:
        return {
            "hierarchical_levels": 1,
            "has_bullet_points": False,
            "has_numbering": False,
            "has_headers": False,
            "spatial_organization": "unknown",
            "diagram_count": 0,
            "arrow_count": 0,
        }

    # Check for bullets and numbering
    has_bullets = any(b["text"].startswith(("•", "-", "*", "–")) for b in blocks)
    has_numbers = any(b["text"][:3].strip().rstrip(".").isdigit() for b in blocks)

    # Estimate hierarchy from indentation (x-coordinate variance)
    x_positions = sorted(set(b["x"] for b in blocks))
    hierarchical_levels = min(len(x_positions), 4)

    # Check for headers (larger blocks at top, or short standalone lines)
    has_headers = any(len(b["text"].split()) <= 5 and b["y"] < 200 for b in blocks)

    # Spatial organization
    x_spread = max(b["x"] for b in blocks) - min(b["x"] for b in blocks) if blocks else 0
    y_spread = max(b["y"] for b in blocks) - min(b["y"] for b in blocks) if blocks else 0
    spatial = "linear" if x_spread < 200 else "columnar" if x_spread > 400 else "clustered"

    return {
        "hierarchical_levels": hierarchical_levels,
        "has_bullet_points": has_bullets,
        "has_numbering": has_numbers,
        "has_headers": has_headers,
        "spatial_organization": spatial,
        "diagram_count": 0,  # Would need object detection for this
        "arrow_count": 0,
    }


def _compute_text_metrics(text: str) -> dict:
    """Compute basic NLP metrics from extracted text."""
    if not text.strip():
        return {"total_words": 0, "unique_words": 0, "type_token_ratio": 0}

    words = text.lower().split()
    total = len(words)
    unique = len(set(words))
    sentences = [s.strip() for s in text.replace("!", ".").replace("?", ".").split(".") if s.strip()]

    return {
        "total_words": total,
        "unique_words": unique,
        "type_token_ratio": round(unique / total, 3) if total > 0 else 0,
        "avg_sentence_length": round(total / len(sentences), 1) if sentences else 0,
        "longest_sentence": max((len(s.split()) for s in sentences), default=0),
    }
