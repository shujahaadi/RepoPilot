import shutil
import tempfile
from pathlib import Path

from git import Repo
from git.exc import GitCommandError

IGNORED_DIRS = {
    ".git",
    ".venv",
    "venv",
    "node_modules",
    "__pycache__",
    "dist",
    "build",
}

MAX_FILE_SIZE = 1_000_000
MAX_FILES = 10_000


def clone_repository(repository_url: str) -> dict:
    temp_dir = tempfile.mkdtemp(prefix="repopilot-")
    repository_path = Path(temp_dir) / "source"

    try:
        Repo.clone_from(
            repository_url,
            repository_path,
            depth=1,
            multi_options=["--no-recurse-submodules"],
        )

        files = []

        for path in repository_path.rglob("*"):
            if any(part in IGNORED_DIRS for part in path.parts):
                continue

            if not path.is_file():
                continue

            size = path.stat().st_size

            if size > MAX_FILE_SIZE:
                continue

            files.append({
                "path": path.relative_to(repository_path).as_posix(),
                "size": size,
                "extension": path.suffix.lower(),
            })

            if len(files) >= MAX_FILES:
                break

        return {
            "repository_url": repository_url,
            "file_count": len(files),
            "files": files,
        }

    except GitCommandError as exc:
        raise ValueError(
            "Could not retrieve the repository. Check the URL and access."
        ) from exc

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)