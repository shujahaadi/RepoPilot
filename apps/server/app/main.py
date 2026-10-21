from fastapi import FastAPI
from pydantic import BaseModel, Field, HttpUrl

app = FastAPI(
    title="RepoPilot API",
    description="Analyze repositories and explore their code relationships.",
    version="0.1.0",
)


class RepositoryRequest(BaseModel):
    url: HttpUrl = Field(
        description="URL of a public GitHub repository to analyze."
    )


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "RepoPilot"}


@app.post("/api/repositories/analyze")
def analyze_repository(request: RepositoryRequest):
    return {
        "message": "Repository analysis endpoint is ready for implementation.",
        "repository_url": str(request.url),
        "status": "pending",
    }
