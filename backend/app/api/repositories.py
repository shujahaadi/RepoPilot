from fastapi import APIRouter, HTTPException

from app.schemas.repository import RepositoryRequest
from app.services.repository_service import clone_repository

router = APIRouter(
    prefix="/api/repositories",
    tags=["Repositories"],
)


@router.post("/analyze")
def analyze_repository(request: RepositoryRequest):
    try:
        result = clone_repository(str(request.url))
        return {
            "status": "completed",
            **result,
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc