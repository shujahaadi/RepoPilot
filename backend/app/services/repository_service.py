import shutil
import tempfile
from pathlib import Path

from git import Repo
from git.exc import GitCommandError

from app.analysis.python_analyzer import analyze_python_file
from app.analysis.graph_builder import build_python_graph

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
MAX_PYTHON_FILES = 500
MAX_REPORT_ITEMS = 100


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
        python_files = []

        for path in repository_path.rglob("*"):
            relative_path = path.relative_to(repository_path)

            if any(part in IGNORED_DIRS for part in relative_path.parts):
                continue

            if path.is_symlink() or not path.is_file():
                continue

            size = path.stat().st_size

            if size > MAX_FILE_SIZE:
                continue

            file_info = {
                "path": relative_path.as_posix(),
                "size": size,
                "extension": path.suffix.lower(),
            }

            files.append(file_info)

            if path.suffix.lower() == ".py":
                python_files.append(path)

            if len(files) >= MAX_FILES:
                break

        # Analyze Python files while the clone still exists.
        analysis_files = []
        total_functions = 0
        total_calls = 0
        total_imports = 0
        syntax_errors = 0

        for path in python_files[:MAX_PYTHON_FILES]:
            report = analyze_python_file(path)

            relative_path = path.relative_to(
                repository_path
            ).as_posix()

            functions = report["functions"]
            calls = report["calls"]
            imports = report["imports"]
            error = report["error"]

            total_functions += len(functions)
            total_calls += len(calls)
            total_imports += len(imports)

            if error is not None:
                syntax_errors += 1

            # Keep the full relationships for a small sample of files.
            # Store counts for every analyzed file.
            file_report = {
                "path": relative_path,
                "function_count": len(functions),
                "call_count": len(calls),
                "import_count": len(imports),
                "error": error,
            }

            if len(analysis_files) < MAX_REPORT_ITEMS:
                file_report["functions"] = functions
                file_report["calls"] = calls
                file_report["imports"] = imports

            analysis_files.append(file_report)

        graph = build_python_graph(repository_path)
        
        return {
            "repository_url": repository_url,
            "file_count": len(files),
            "files": files,
            "graph": graph,
            "python_analysis": {
                "python_files_found": len(python_files),
                "python_files_analyzed": min(
                    len(python_files),
                    MAX_PYTHON_FILES,
                ),
                "analysis_limit_reached": (
                    len(python_files) > MAX_PYTHON_FILES
                ),
                "total_functions": total_functions,
                "total_calls": total_calls,
                "total_imports": total_imports,
                "syntax_errors": syntax_errors,
                "files": analysis_files,
            },
        }

    except GitCommandError as exc:
        raise ValueError(
            "Could not retrieve the repository. Check the URL and access."
        ) from exc

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)