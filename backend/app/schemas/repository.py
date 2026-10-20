from pydantic import BaseModel, Field, HttpUrl


class RepositoryRequest(BaseModel):
    url: HttpUrl = Field(
        description="URL of a public GitHub repository to analyze."
    )