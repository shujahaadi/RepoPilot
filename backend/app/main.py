from fastapi import FastAPI

from app.api.repositories import router as repositories_router

app = FastAPI(
    title="RepoPilot API",
    description="Analyze repositories and explore their code relationships.",
    version="0.1.0",
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "RepoPilot"}


app.include_router(repositories_router)