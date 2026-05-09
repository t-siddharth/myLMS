from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import json

router = APIRouter()


class SurveyData(BaseModel):
    name: str = ""
    age: str = ""
    education_level: str = ""
    transition_type: str = ""
    current_status: str = ""
    goals: str = ""
    interests: str = ""
    skills: str = ""
    languages: str = ""
    experience: str = ""
    ikigai: dict = {}
    self_regulation: dict = {}


class ChatData(BaseModel):
    recall: str = ""
    comprehension: str = ""
    application: str = ""
    analysis: str = ""
    creation: str = ""


# In-memory store for MVP (replace with DB later)
_sessions = {}


@router.post("/survey")
async def submit_survey(data: SurveyData):
    """Store survey responses for profile generation."""
    session_id = f"session_{hash(data.name + data.goals)}"
    _sessions[session_id] = {"survey": data.model_dump()}
    return {
        "status": "ok",
        "session_id": session_id,
        "message": "Survey data received. Proceed to video and notes."
    }


@router.post("/chat")
async def submit_chat(data: ChatData):
    """Store AI chat responses."""
    return {
        "status": "ok",
        "message": "Chat responses received.",
        "data": data.model_dump()
    }


@router.post("/assessments")
async def submit_assessments(data: dict):
    """Store micro-assessment results."""
    return {
        "status": "ok",
        "message": "Assessment results received.",
        "data": data
    }
