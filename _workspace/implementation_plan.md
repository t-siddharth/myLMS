# NeuroCog LMS — Implementation Plan

## Goal

Build a working MVP of the Cognitive-Aware Learning Management System that takes a learner through the Discovery intake flow, builds a multi-dimensional cognitive profile, and recommends personalized learning paths — all grounded in the research frameworks we validated.

## User Review Required

> [!IMPORTANT]
> **Tech Stack Decision:** I'm proposing Vite+React for the frontend and Python FastAPI for the backend. This keeps us on your Google Cloud stack and gives us easy access to Vision API and Gemini. If the team prefers a different stack, flag it now.

> [!IMPORTANT]
> **Scope for MVP:** This plan builds the **Discovery Stage only** — the intake flow, profile generation, and path recommendation. It does NOT include course delivery, the LMS shell, or the Commitment Stage. Those are Phase 2+.

> [!WARNING]
> **API Keys Required:** We'll need a Google Cloud API key with Vision API and Gemini API enabled. Please confirm you have this before we start Phase 3.

## Open Questions

1. **Do you have a Gemini API key ready**, or should I use a mock LLM layer for the first build?
2. **Should the intake video be a real YouTube embed**, or a placeholder for now?
3. **Do you want the audio chat to be a real AI voice conversation** (requires speech-to-text + Gemini), or a text-based chat for MVP?

---

## Proposed Changes

### Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Vite + React | Fast dev server, modern tooling, your team can contribute easily |
| Styling | Vanilla CSS with design tokens | Premium dark theme, glassmorphism, micro-animations |
| Backend API | Python FastAPI | Best Python web framework for async AI workloads |
| Handwriting OCR | Google Cloud Vision API | Best-in-class handwriting recognition, you're on Google stack |
| LLM Analysis | Google Gemini API | Structured output, multimodal, your existing stack |
| Database (MVP) | SQLite via SQLAlchemy | Zero-config, portable, good enough for prototype |
| Audio Processing | Web Speech API (browser) + Gemini | Browser-native speech-to-text, then Gemini for analysis |

### Project Structure

```
Neuro_Cog_LMS/
├── frontend/                    # Vite + React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── IntakeSurvey.jsx        # Step 1: Ikigai + self-reg questionnaire
│   │   │   ├── VideoNotes.jsx          # Step 2: Watch video + upload notes
│   │   │   ├── AudioChat.jsx           # Step 3: AI conversation
│   │   │   ├── MicroAssessments.jsx    # Step 4: Stroop + digit span (optional)
│   │   │   ├── LearnerProfile.jsx      # Profile dashboard (5 domains + CUTRICE)
│   │   │   ├── PathRecommendation.jsx  # 3 recommended paths with confidence
│   │   │   └── ui/                     # Shared UI components
│   │   ├── pages/
│   │   │   ├── Landing.jsx             # Welcome + value proposition
│   │   │   ├── Discovery.jsx           # Multi-step intake flow
│   │   │   └── Dashboard.jsx           # Profile + recommendations
│   │   ├── styles/
│   │   │   └── index.css               # Design system + tokens
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/                     # Python FastAPI
│   ├── app/
│   │   ├── main.py                     # FastAPI app + CORS
│   │   ├── routers/
│   │   │   ├── intake.py               # Survey submission endpoint
│   │   │   ├── handwriting.py          # Image upload → Vision API → scoring
│   │   │   ├── audio.py                # Audio analysis endpoint
│   │   │   └── profile.py              # Profile retrieval + path recommendations
│   │   ├── services/
│   │   │   ├── vision_analyzer.py      # Google Vision API integration
│   │   │   ├── cognitive_scorer.py     # LLM-based cognitive domain scoring
│   │   │   ├── linguistic_analyzer.py  # NLP + multilingual detection
│   │   │   ├── profile_builder.py      # Composite profile construction
│   │   │   └── path_recommender.py     # Curriculum architect (3 paths)
│   │   ├── models/
│   │   │   ├── learner.py              # Learner profile data model
│   │   │   └── schemas.py              # Pydantic request/response schemas
│   │   └── db.py                       # SQLite connection
│   ├── requirements.txt
│   └── .env.example
│
├── _workspace/                  # Team docs (already exists)
├── .gitignore
└── README.md
```

---

### Phase 1: Frontend Scaffold + Design System
**Estimated time: ~1 hour**

#### [NEW] `frontend/` — Vite React app

- Initialize with `npx -y create-vite@latest ./` (React template)
- Build the design system in `index.css`: dark theme, gradients, glassmorphism cards, smooth transitions
- Create the app shell with navigation: Landing → Discovery → Dashboard
- Build reusable UI components: progress stepper, animated cards, score gauges, radar charts

---

### Phase 2: Intake Discovery Flow (Frontend)
**Estimated time: ~2 hours**

#### [NEW] `IntakeSurvey.jsx`
- Multi-section form: demographics, education, career goals, Ikigai 4-quadrant reflections, self-regulation questionnaire (10 Likert items)
- Animated transitions between sections
- Stores responses in local state, submits to backend

#### [NEW] `VideoNotes.jsx`
- Embedded YouTube video (curated 5-min video based on survey interests)
- Instructions to watch and take handwritten notes
- Camera/file upload for note photo
- Image preview + submit

#### [NEW] `AudioChat.jsx`
- Browser-based speech-to-text (Web Speech API)
- AI asks 5 escalating questions (recall → comprehension → application → analysis → creation)
- Shows transcript as learner speaks
- Sends transcript to backend for analysis

#### [NEW] `MicroAssessments.jsx` (optional step)
- Digital Stroop task (color-word interference, timed)
- Digit span (forward + backward, interactive)
- Brief categorization exercise (drag-and-drop grouping)
- Framed as "brain games" not tests

---

### Phase 3: Backend — AI Metacognition Analyzer
**Estimated time: ~2 hours**

#### [NEW] `backend/` — FastAPI application

##### `vision_analyzer.py`
- Receives uploaded handwriting image
- Sends to Google Cloud Vision API for OCR + spatial coordinate extraction
- Returns structured JSON: text blocks with (x, y, width, height) positions, detected diagrams/arrows

##### `cognitive_scorer.py`
- Takes Vision API output + video transcript + survey responses + audio transcript
- Sends to Gemini with a structured scoring prompt
- Prompt instructs Gemini to score 5 cognitive domains (1-10) with evidence citations
- Also scores CUTRICE motivational dimensions from Ikigai responses
- Returns structured JSON scores + confidence levels

##### `linguistic_analyzer.py`
- NLP analysis of all text inputs (notes, survey reflections, audio transcript)
- Computes: vocabulary diversity (TTR, MTLD), sentence complexity, code-switching detection
- Multilingual detection: language identification per segment, bilingualism flag
- Bias correction: adjusts Language Complexity score for L2 speakers

##### `profile_builder.py`
- Aggregates all scores using weighted composite formula from our design doc
- Constructs the full learner profile: 5 cognitive domains + CUTRICE + asset inventory
- Computes overall profile confidence based on number and quality of inputs
- Stores profile in database

##### `path_recommender.py`
- Loads learner profile + available courses (mock course catalog for MVP)
- Generates 3 paths: Strength-Leveraging, Growth-Stretching, Interest-Aligned
- Each path includes: confidence %, rationale, competency outcomes, stretch factor
- Returns ranked recommendations with explainability data

---

### Phase 4: Learner Profile Dashboard (Frontend)
**Estimated time: ~1.5 hours**

#### [NEW] `LearnerProfile.jsx`
- Radar chart showing 5 cognitive domains (animated reveal)
- CUTRICE motivational profile (horizontal bar chart)
- Asset inventory display (tags/chips for skills, experience, languages)
- Discovery stage progress indicator with confidence meter
- "What this means" plain-language summary generated by LLM

#### [NEW] `PathRecommendation.jsx`
- 3 path cards with glassmorphism styling
- Each card shows: path name, confidence %, strength/growth mapping, competency badges, estimated time
- Expandable "Why we recommend this" section showing the data points
- "Choose this path" button + "I want something different" override with reason field

---

### Phase 5: Integration + Polish
**Estimated time: ~1 hour**

- Connect frontend → backend API calls
- End-to-end flow testing: survey → video → notes → audio → profile → recommendations
- Error handling and loading states
- Responsive design for tablet/desktop
- Micro-animations and transitions polish

---

### Phase 6: Push to GitHub
- Commit all code
- Update `_workspace/collaboration_log.md`
- Push to `t-siddharth/myLMS`

---

## Verification Plan

### Automated Tests
- Backend: Test each service with mock inputs (sample handwriting image, sample survey JSON, sample audio transcript)
- API: Hit each endpoint with curl/httpie and verify response schemas

### Manual Verification
- Walk through the full intake flow in the browser
- Verify profile generation produces sensible scores from test inputs
- Verify 3 path recommendations are distinct and map to different profile strengths
- Test with simulated multilingual input to verify bias correction
- Screenshot/record the full user journey

### Browser Testing
- Use browser subagent to verify UI renders correctly
- Test the multi-step intake flow navigation
- Verify profile dashboard charts display properly
