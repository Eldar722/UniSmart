"""
UniSmart Backend - FastAPI Application

AI-powered educational navigation platform for university selection in Kazakhstan.
The AI acts as an analytical engine that explains recommendations based on computed match scores.

Architecture:
- Business logic computes deterministic match scores
- AI service interprets scores and generates explanations
- Clear separation ensures transparency and explainability
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router

app = FastAPI(
    title="UniSmart API",
    description="AI-powered university recommendation engine for Kazakhstan",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api")

@app.get("/api/hello")
async def hello():
    return {"message": "message from FastAPI"}
