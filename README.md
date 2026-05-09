# NeuroCog LMS — Cognitive-Aware Learning Recommendation Engine

A neuro-cognitive AI recommendation engine that builds individualized learner profiles and generates personalized learning path recommendations. Designed as a **standalone tool that integrates with existing LMS platforms** (Moodle, Canvas, Open edX, or any LTI 1.3-compatible system).

---

## What It Does

Most LMS platforms deliver the same content to every learner. NeuroCog changes that by first understanding *how* a learner thinks, then recommending the right path for them specifically.

The system takes a learner through a **Discovery intake flow** — a multi-modal experience that collects signals without feeling like a test — and produces:

1. A **cognitive profile** across 5 domains (Attention/Working Memory, Executive Functions, Memory, Visuospatial Abilities, Language)
2. A **motivational profile** using the CUTRICE framework (grounded in Self-Determination Theory) and Ikigai career-alignment
3. **3 personalized learning path recommendations** — Strength-Leveraging, Growth-Stretching, and Interest-Aligned — each with confidence scores and plain-language rationale

---

## Architecture

```
Learner → Discovery Intake Flow → AI Metacognition Analyzer → Path Recommendations
              │                           │
              ▼                           ▼
    Survey + Video + Handwriting    Cognitive profile (5 domains)
    + AI Audio Chat + Assessments   + CUTRICE motivational profile
                                    + Asset inventory
```

**Frontend** (`frontend/`) — Vite + React, premium dark UI
- Multi-step Discovery intake flow (survey → video → handwritten notes → AI audio chat → optional micro-assessments)
- Learner profile dashboard with radar chart and domain scores
- Path recommendation cards with explainability

**Backend** (`backend/`) — Python FastAPI
- `vision_analyzer.py` — Handwriting OCR via Google Cloud Vision API
- `cognitive_scorer.py` — LLM scoring of 5 cognitive domains via Gemini
- `linguistic_analyzer.py` — Multilingual detection, vocabulary analysis, bias correction for L2 speakers
- `profile_builder.py` — Composite profile construction with confidence scoring
- `path_recommender.py` — Generates 3 distinct recommended paths

**AI Stack:** Google Gemini API (analysis + structured scoring) + Google Cloud Vision API (handwriting OCR)  
**Database:** Postgres (via Docker) for the V1 ERD schema; SQLite for the MVP recommendation engine

---

## LMS Integration

NeuroCog is built to plug into your existing LMS rather than replace it. Three integration approaches:

| Approach | How | Best For |
|---|---|---|
| **LTI 1.3 Tool** | Embed as an iframe in any LMS — Moodle, Canvas, Blackboard, Sakai | Maximum portability; one tool for any platform |
| **Moodle Plugin** | Local plugin + AI Placement using Moodle's native AI subsystem (4.5+) | Moodle-first deployments; access to 700+ web service functions |
| **Headless API** | Call the FastAPI backend directly from any frontend or LMS | Custom frontends; full control over UI |

---

## MVP Scope

This repository builds the **Discovery Stage only**:
- ✅ Multi-modal intake flow
- ✅ Cognitive + motivational profile generation
- ✅ 3 personalized path recommendations with confidence scores

Out of scope for MVP: course delivery, LMS shell, Commitment Stage, human coach layer.

---

## Setup

**Prerequisites:** Google Cloud API key with Vision API and Gemini API enabled.

### Database

Start the local Postgres instance (V1 ERD schema):

```bash
docker compose up -d
```

```text
Host: localhost
Port: 5432
Database: mylms
User: mylms
Password: mylms_dev_password
DATABASE_URL=postgresql://mylms:mylms_dev_password@localhost:5432/mylms
```

The schema (`db/init/001_schema.sql`) is initialized on first run and includes: `user_layer`, `instructor_layer`, `admin_layer`, `data_layer`, `output_llm_layer`.

### Backend + Frontend

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env   # add your Google Cloud API key
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Team Collaboration

This project uses `_workspace/` as a shared coordination layer across distributed team members and AI agents:

- `_workspace/collaboration_log.md` — Read this first every session; log your work here
- `_workspace/research_analysis.md` — Research foundation (25+ papers synthesized)
- `_workspace/implementation_plan.md` — Full technical build plan
- `_workspace/response_to_comments.md` — Design decisions with rationale
