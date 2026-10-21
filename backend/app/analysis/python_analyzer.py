import ast

class PythonAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.functions = []
        self.classes = []
        self.calls = []
        self.imports = []
        self.scope = []

    def current_scope(self):
        return ".".join(self.scope) if self.scope else None

    def visit_FunctionDef(self, node):
        self._visit_function(node)

    def visit_AsyncFunctionDef(self, node):
        self._visit_function(node)

    def _visit_function(self, node):
        parent = self.current_scope()
        qualified_name = (
            f"{parent}.{node.name}" if parent else node.name
        )

        self.functions.append({
            "name": node.name,
            "qualified_name": qualified_name,
            "line": node.lineno,
            "async": isinstance(node, ast.AsyncFunctionDef),
        })

        self.scope.append(node.name)
        for statement in node.body:
            self.visit(statement)
        self.scope.pop()

    def visit_ClassDef(self, node):
        parent = self.current_scope()
        qualified_name = (
            f"{parent}.{node.name}" if parent else node.name
        )

        self.classes.append({
            "name": node.name,
            "qualified_name": qualified_name,
            "line": node.lineno,
        })

        self.scope.append(node.name)
        for statement in node.body:
            self.visit(statement)
        self.scope.pop()

    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append({
                "module": alias.name,
                "alias": alias.asname,
                "line": node.lineno,
            })

    def visit_ImportFrom(self, node):
        for alias in node.names:
            self.imports.append({
                "module": node.module or "",
                "name": alias.name,
                "alias": alias.asname,
                "level": node.level,
                "line": node.lineno,
            })

    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            callee = node.func.id
        elif isinstance(node.func, ast.Attribute):
            callee = node.func.attr
        else:
            callee = "<unknown>"

        self.calls.append({
            "caller": self.current_scope(),
            "callee": callee,
            "line": node.lineno,
        })

        self.generic_visit(node)


def analyze_python(source_code: str) -> dict:
    try:
        tree = ast.parse(source_code)
    except SyntaxError as exc:
        return {
            "functions": [],
            "classes": [],
            "calls": [],
            "imports": [],
            "error": {
                "message": exc.msg,
                "line": exc.lineno,
            },
        }

    analyzer = PythonAnalyzer()
    analyzer.visit(tree)

    return {
        "functions": analyzer.functions,
        "classes": analyzer.classes,
        "calls": analyzer.calls,
        "imports": analyzer.imports,
        "error": None,
    }


def analyze_python_file(file_path):
    from pathlib import Path

    file_path = Path(file_path)

    try:
        source_code = file_path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        return {
            "file": file_path.as_posix(),
            "functions": [],
            "classes": [],
            "calls": [],
            "imports": [],
            "error": {
                "message": str(exc),
                "line": None,
            },
        }

    
    report = analyze_python(source_code)
    relative_path = file_path.as_posix()
    report["file"] = relative_path

    for function in report["functions"]:
        function["id"] = (
            f"{relative_path}::{function['qualified_name']}"
        )

    for cls in report["classes"]:
        cls["id"] = f"{relative_path}::{cls['qualified_name']}"

    for call in report["calls"]:
        call["caller_id"] = (
            f"{relative_path}::{call['caller']}"
            if call["caller"] is not None
            else f"{relative_path}::<module>"
        )

    return report

if __name__ == "__main__":
    file_path = "app/analysis/python_analyzer.py"
    print(analyze_python_file(file_path))