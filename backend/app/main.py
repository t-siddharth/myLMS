from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import intake, handwriting, profile

load_dotenv()

app = FastAPI(
    title="NeuroCog LMS API",
    description="AI-powered cognitive profiling and learning path recommendation engine",
    version="0.1.0"
)

# CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(intake.router, prefix="/api/intake", tags=["Intake"])
app.include_router(handwriting.router, prefix="/api/handwriting", tags=["Handwriting"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])

@app.get("/")
async def root():
    return {"status": "ok", "service": "NeuroCog LMS API", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
