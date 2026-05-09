from fastapi import APIRouter, UploadFile, File
from app.services.vision_analyzer import analyze_handwriting
import base64

router = APIRouter()


@router.post("/analyze")
async def analyze_notes(file: UploadFile = File(...)):
    """
    Receive a handwritten notes image, send to Vision API for OCR,
    and return structured analysis.
    """
    contents = await file.read()
    image_b64 = base64.b64encode(contents).decode("utf-8")
    
    try:
        result = await analyze_handwriting(image_b64)
        return {
            "status": "ok",
            "analysis": result
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "analysis": _fallback_analysis()
        }


def _fallback_analysis():
    """Fallback when Vision API is unavailable."""
    return {
        "text_blocks": [
            {"text": "Sample extracted text from notes", "x": 50, "y": 50, "width": 400, "height": 30}
        ],
        "structural_analysis": {
            "hierarchical_levels": 2,
            "has_bullet_points": True,
            "has_numbering": False,
            "has_headers": True,
            "spatial_organization": "linear",
            "diagram_count": 0,
            "arrow_count": 0,
        },
        "text_metrics": {
            "total_words": 85,
            "unique_words": 62,
            "type_token_ratio": 0.73,
            "avg_sentence_length": 12.5,
            "longest_sentence": 22,
        },
        "confidence": 0.5,
        "source": "fallback"
    }
