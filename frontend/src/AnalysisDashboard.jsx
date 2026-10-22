import CallGraph from "./CallGraph";

const panel = {
  background: "#161B22",
  border: "1px solid #30363D",
  borderRadius: "12px",
  padding: "20px",
};

const muted = { color: "#8B949E" };

function StatCard({ label, value, detail, accent = "#58A6FF" }) {
  return (
    <div
      style={{
        ...panel,
        minWidth: 0,
        borderTop: `2px solid ${accent}`,
      }}
    >
      <p style={{ ...muted, fontSize: "13px", margin: 0 }}>{label}</p>
      <div style={{ fontSize: "30px", fontWeight: 700, margin: "12px 0 4px" }}>
        {value}
      </div>
      <p style={{ ...muted, fontSize: "12px", margin: 0 }}>{detail}</p>
    </div>
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function AnalysisDashboard({ result }) {
  if (!result) return null;

  const analysis = result.python_analysis || {};
  const graph = result.graph || {};
  const files = result.files || [];
  const nodes = graph.nodes || [];
  const edges = graph.edges || [];
  
  const pythonFiles = analysis.files || [];
  const allFunctions = pythonFiles.flatMap((file) =>
    (file.functions || []).map((fn) => ({
      ...fn,
      file: file.path,
    }))
  );

  const resolvedCalls = edges.filter(
    (edge) => edge.resolution === "resolved"
  ).length;

  const unresolvedCalls = edges.filter(
    (edge) => edge.resolution === "unresolved"
  ).length;

  return (
    <section
      style={{
        width: "100%",
        maxWidth: "1440px",
        margin: "48px auto",
        padding: "0 32px 48px",
        boxSizing: "border-box",
        color: "#E6EDF3",
        textAlign: "left",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <p
          style={{
            color: "#3FB950",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "1.8px",
          }}
        >
          ANALYSIS COMPLETE
        </p>

        <h2 style={{ fontSize: "28px", margin: "8px 0" }}>
          Repository overview
        </h2>

        <a
          href={result.repository_url}
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#58A6FF",
            fontSize: "13px",
            overflowWrap: "anywhere",
          }}
        >
          {result.repository_url}
        </a>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        <StatCard
          label="Total files"
          value={result.file_count ?? files.length}
          detail="Files discovered"
        />
        <StatCard
          label="Python files"
          value={analysis.python_files_found ?? pythonFiles.length}
          detail={`${analysis.python_files_analyzed ?? pythonFiles.length} analyzed`}
          accent="#BC8CFF"
        />
        <StatCard
          label="Functions"
          value={analysis.total_functions ?? allFunctions.length}
          detail="Functions detected"
          accent="#3FB950"
        />
        <StatCard
          label="Call edges"
          value={graph.call_edges ?? edges.length}
          detail="Function relationships"
          accent="#D29922"
        />
        <StatCard
          label="Imports"
          value={analysis.total_imports ?? 0}
          detail="Import statements"
          accent="#F78166"
        />
        <StatCard
          label="Syntax errors"
          value={analysis.syntax_errors ?? 0}
          detail="Across analyzed files"
          accent={analysis.syntax_errors > 0 ? "#F85149" : "#3FB950"}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div style={panel}>
          <h3 style={{ marginTop: 0 }}>Python analysis</h3>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 700 }}>
                {analysis.total_calls ?? 0}
              </div>
              <span style={{ ...muted, fontSize: "12px" }}>Calls detected</span>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 700 }}>
                {analysis.total_imports ?? 0}
              </div>
              <span style={{ ...muted, fontSize: "12px" }}>Imports detected</span>
            </div>
          </div>

          {analysis.analysis_limit_reached && (
            <p style={{ color: "#D29922", fontSize: "13px" }}>
              Analysis limit reached. Some files may not have been analyzed.
            </p>
          )}
        </div>

        <div style={panel}>
          <h3 style={{ marginTop: 0 }}>Call resolution</h3>
          <p style={{ ...muted, fontSize: "13px" }}>
            How many graph edges were resolved to known definitions.
          </p>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "#3FB950", fontSize: "24px", fontWeight: 700 }}>
                {resolvedCalls}
              </div>
              <span style={{ ...muted, fontSize: "12px" }}>Resolved</span>
            </div>
            <div>
              <div style={{ color: "#D29922", fontSize: "24px", fontWeight: 700 }}>
                {unresolvedCalls}
              </div>
              <span style={{ ...muted, fontSize: "12px" }}>Unresolved</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...panel, marginBottom: "24px" }}>
        <CallGraph graph={graph} />
        <h3 style={{ marginTop: 0 }}>Repository files</h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr style={{ ...muted, textAlign: "left" }}>
                <th style={{ padding: "12px 8px" }}>File path</th>
                <th style={{ padding: "12px 8px" }}>Type</th>
                <th style={{ padding: "12px 8px", textAlign: "right" }}>Size</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.path} style={{ borderTop: "1px solid #30363D" }}>
                  <td
                    style={{
                      padding: "12px 8px",
                      overflowWrap: "anywhere",
                      color: "#C9D1D9",
                    }}
                  >
                    <span style={{ color: "#58A6FF", marginRight: "8px" }}>
                      {file.extension === ".py" ? "Py" : "•"}
                    </span>
                    {file.path}
                  </td>
                  <td style={{ padding: "12px 8px", ...muted }}>
                    {file.extension || "Other"}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right", ...muted }}>
                    {formatSize(file.size)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={panel}>
        <h3 style={{ marginTop: 0 }}>Detected functions</h3>
        <p style={{ ...muted, fontSize: "13px" }}>
          Function names, source files, and line numbers.
        </p>

        {allFunctions.length === 0 ? (
          <p style={muted}>No functions were found in the analyzed files.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {allFunctions.map((fn) => (
              <div
                key={fn.id || `${fn.file}:${fn.name}:${fn.line}`}
                style={{
                  padding: "12px",
                  background: "#0D1117",
                  border: "1px solid #30363D",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <code style={{ color: "#79C0FF" }}>{fn.name}</code>
                  <div style={{ ...muted, fontSize: "12px", marginTop: "5px" }}>
                    {fn.file}
                  </div>
                </div>
                <span style={{ ...muted, fontSize: "12px" }}>
                  Line {fn.line}
                  {fn.async ? " · async" : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={{ ...muted, fontSize: "12px", marginTop: "20px" }}>
        Graph contains {nodes.length} definitions and {edges.length} call edges.
        {graph.files_analyzed != null &&
          ` ${graph.files_analyzed} Python files analyzed for the graph.`}
      </p>
    </section>
  );
}