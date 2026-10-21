from pathlib import Path
from app.analysis.python_analyzer import analyze_python_file

def build_python_graph(repository_path: Path) -> dict:
    repository_path = Path(repository_path)

    ignored_dirs = {
        ".git",
        ".venv",
        "venv",
        "node_modules",
        "__pycache__",
        "dist",
        "build",
    }

    reports = []
    definitions_by_name = {}

    for path in repository_path.rglob("*.py"):
        relative_path = path.relative_to(repository_path)

        if any(part in ignored_dirs for part in relative_path.parts):
            continue

        if path.is_symlink() or not path.is_file():
            continue

        report = analyze_python_file(path)
        report["file"] = relative_path.as_posix()

        # Normalize definition IDs to repository-relative paths.
        for function in report["functions"]:
            function["id"] = (
                f"{report['file']}::{function['qualified_name']}"
            )

        for cls in report["classes"]:
            cls["id"] = (
                f"{report['file']}::{cls['qualified_name']}"
            )

        # Normalize caller IDs too.
        for call in report["calls"]:
            if call["caller"] is None:
                call["caller_id"] = f"{report['file']}::<module>"
            else:
                call["caller_id"] = (
                    f"{report['file']}::{call['caller']}"
                )

        # Rebuild IDs relative to the repository root.
        for function in report["functions"]:
            function["id"] = (
                f"{report['file']}::{function['qualified_name']}"
            )
            definitions_by_name.setdefault(
                function["name"], []
            ).append(function["id"])

        for cls in report["classes"]:
            cls["id"] = (
                f"{report['file']}::{cls['qualified_name']}"
            )
            definitions_by_name.setdefault(
                cls["name"], []
            ).append(cls["id"])

        reports.append(report)

    edges = []

    for report in reports:
        for call in report["calls"]:
            matches = definitions_by_name.get(
                call["callee"], []
            )

            if len(matches) == 1:
                target_id = matches[0]
                resolution = "resolved"
            elif len(matches) > 1:
                target_id = None
                resolution = "ambiguous"
            else:
                target_id = None
                resolution = "unresolved"

            caller_id = call.get("caller_id")

            # Ensure module-level callers use repository-relative paths.
            if call["caller"] is None:
                caller_id = f"{report['file']}::<module>"

            edges.append({
                "source": caller_id,
                "target": target_id,
                "kind": "call",
                "callee": call["callee"],
                "file": report["file"],
                "line": call["line"],
                "resolution": resolution,
                "candidates": matches if len(matches) > 1 else [],
            })

    nodes = []

    for report in reports:
        for function in report["functions"]:
            nodes.append({
                "id": function["id"],
                "name": function["name"],
                "qualified_name": function["qualified_name"],
                "kind": "function",
                "file": report["file"],
                "line": function["line"],
            })

        for cls in report["classes"]:
            nodes.append({
                "id": cls["id"],
                "name": cls["name"],
                "qualified_name": cls["qualified_name"],
                "kind": "class",
                "file": report["file"],
                "line": cls["line"],
            })

    return {
        "nodes": nodes,
        "edges": edges,
        "files_analyzed": len(reports),
        "definitions": len(nodes),
        "call_edges": len(edges),
    }