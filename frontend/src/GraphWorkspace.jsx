import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo, useState } from "react";

const colors = {
  background: "#0D1117",
  panel: "#161B22",
  border: "#30363D",
  text: "#E6EDF3",
  muted: "#8B949E",
  blue: "#58A6FF",
  green: "#3FB950",
  purple: "#BC8CFF",
};

function FunctionNode({ data, selected }) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#58A6FF",
          width: 8,
          height: 8,
          border: "2px solid #0D1117",
        }}
      />

      <div
        style={{
          minWidth: 150,
          padding: "12px 14px",
          background: selected ? "#1F3B59" : "#161B22",
          border: `1px solid ${selected ? "#79C0FF" : "#30363D"}`,
          borderRadius: 10,
          color: "#E6EDF3",
          boxShadow: selected ? "0 0 18px #58A6FF30" : "none",
        }}
      >
        <div style={{ color: "#79C0FF", fontSize: 12, fontWeight: 700 }}>
          {data.name}
        </div>

        <div
          style={{
            color: "#8B949E",
            fontSize: 10,
            marginTop: 7,
            maxWidth: 180,
            overflowWrap: "anywhere",
          }}
        >
          {data.file || "Unknown file"}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#58A6FF",
          width: 8,
          height: 8,
          border: "2px solid #0D1117",
        }}
      />
    </>
  );
}

const nodeTypes = {
  functionNode: FunctionNode,
};

export default function GraphWorkspace({ result, onBack }) {
const [search, setSearch] = useState("");

const graph = result?.graph || {};
const rawNodes = graph.nodes || [];
const rawEdges = graph.edges || [];

const initialNodes = useMemo(
() =>
    rawNodes.map((node, index) => ({
    id: node.id,
    type: "functionNode",
    position: {
        x: 100 + (index % 4) * 240,
        y: 100 + Math.floor(index / 4) * 150,
    },
    data: {
        name: node.name || node.id,
        file: node.file || "",
    },
    })),
[rawNodes]
);

const initialEdges = useMemo(
() =>
    rawEdges
    .filter((edge) =>
        rawNodes.some((node) => node.id === edge.source) &&
        rawNodes.some((node) => node.id === edge.target)
    )
    .map((edge, index) => ({
        id: `${edge.source}-${edge.target}-${index}`,
        source: edge.source,
        target: edge.target,
        type: "default",
        animated: true,
        markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.resolution === "resolved" ? "#58A6FF" : "#D29922",
        },
        style: {
        stroke: edge.resolution === "resolved" ? "#58A6FF" : "#D29922",
        strokeWidth: 2,
        opacity: 0.95,
        },
    })),
[rawEdges, rawNodes]
);

const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(initialNodes);
const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(initialEdges);
const [selectedNode, setSelectedNode] = useState(null);

const filteredNodes = flowNodes.filter(
  (node) =>
    (node.data.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (node.data.file || "").toLowerCase().includes(search.toLowerCase())
);

const filteredNodeIds = new Set(
  filteredNodes.map((node) => node.id)
);

const filteredEdges = flowEdges.filter(
  (edge) =>
    filteredNodeIds.has(edge.source) &&
    filteredNodeIds.has(edge.target)
);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.background,
        color: colors.text,
        fontFamily: "inherit",
      }}
    >
    {/* Workspace header */}
    
    <header
    style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 20,
        padding: "24px 32px",
        borderBottom: `1px solid ${colors.border}`,
        background:
        "radial-gradient(ellipse at 50% 0%, rgba(88,166,255,0.10), transparent 65%), #161B22",
    }}
    >
    <div style={{ justifySelf: "start" }}>
        <button
        onClick={onBack}
        type="button"
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "10px 15px",
            borderRadius: 9,
            border: "1px solid #3B4654",
            background: "#212B38",
            color: colors.text,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
            transition: "background 160ms ease, border-color 160ms ease",
        }}
        onMouseEnter={(event) => {
            event.currentTarget.style.background = "#2D3B4D";
            event.currentTarget.style.borderColor = colors.blue;
        }}
        onMouseLeave={(event) => {
            event.currentTarget.style.background = "#212B38";
            event.currentTarget.style.borderColor = "#3B4654";
        }}
        >
        <span aria-hidden="true">←</span>
        All repositories
        </button>
    </div>

    <div style={{ textAlign: "center", minWidth: 0 }}>
        <div
        style={{
            color: colors.blue,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 2,
            marginBottom: 8,
        }}
        >
        REPOPILOT / ANALYSIS
        </div>

        <h1
        style={{
            margin: 0,
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: "-0.8px",
        }}
        >
        Repository Workspace
        </h1>

        <p
        style={{
            color: colors.muted,
            fontSize: 12,
            margin: "9px 0 0",
            overflowWrap: "anywhere",
        }}
        >
        {result?.repository_url}
        </p>
    </div>

    <div
        style={{
        justifySelf: "end",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 13px",
        borderRadius: 20,
        border: "1px solid #245B3A",
        background: "#173A2A",
        color: colors.green,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        }}
    >
        <span
        style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: colors.green,
            boxShadow: "0 0 8px #3FB95080",
        }}
        />
        Analysis complete
    </div>
    </header>


      {/* Statistics */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 14,
          padding: "24px 28px",
        }}
      >
        {[
          {
            label: "Repository files",
            value: result?.file_count ?? result?.files?.length ?? 0,
            color: colors.blue,
          },
          {
            label: "Graph nodes",
            value: rawNodes.length,
            color: colors.purple,
          },
          {
            label: "Connections",
            value: rawEdges.length,
            color: colors.green,
          },
          {
            label: "Python files",
            value: result?.python_analysis?.python_files_found ?? 0,
            color: "#D29922",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: 18,
              border: `1px solid ${colors.border}`,
              borderTop: `2px solid ${stat.color}`,
              borderRadius: 10,
              background: colors.panel,
            }}
          >
            <div style={{ color: colors.muted, fontSize: 12 }}>
              {stat.label}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                marginTop: 10,
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </section>

      {/* Main workspace */}
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "260px minmax(0, 1fr)",
          gap: 18,
          padding: "0 28px 28px",
        }}
      >
        {/* Repository explorer */}
        <aside
          style={{
            background: colors.panel,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: 16,
            minWidth: 0,
          }}
        >
          <h3 style={{ margin: "0 0 14px", fontSize: 15 }}>
            Repository explorer
          </h3>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search functions..."
            aria-label="Search functions"
            style={{
              boxSizing: "border-box",
              width: "100%",
              padding: "10px 12px",
              background: colors.background,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: 7,
              outline: "none",
            }}
          />

          <p
            style={{
              color: colors.muted,
              fontSize: 12,
              marginTop: 18,
            }}
          >
            {rawNodes.filter((node) =>
                (node.name || "").toLowerCase().includes(search.toLowerCase())
            ).length}{" "}
            matching graph nodes
          </p>
        </aside>

        {/* Graph area */}
        <section
          style={{
            minWidth: 0,
            minHeight: 440,
            background: colors.panel,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: 20,
          }}
        >
          <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>
            Interactive call graph
          </h2>

          <p style={{ color: colors.muted, fontSize: 13 }}>
            Explore function definitions and their relationships.
          </p>

          <div
            style={{
                height: 520,
                marginTop: 18,
                border: `1px solid ${colors.border}`,
                borderRadius: 9,
                overflow: "hidden",
                background: colors.background,
            }}
            >
            <ReactFlow
                nodes={filteredNodes}
                edges={filteredEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.15}
                maxZoom={2}
                onNodeClick={(_, node) => setSelectedNode(node)}
                onPaneClick={() => setSelectedNode(null)}
            >
                <Background color="#30363D" gap={22} />
                <Controls />
                <MiniMap
                    nodeColor={(node) =>
                        node.selected ? "#58A6FF" : "#6E7681"
                    }
                    maskColor="rgba(13, 17, 23, 0.75)"
                    style={{
                        background: "#161B22",
                        border: "1px solid #30363D",
                        borderRadius: 10,
                    }}
                    nodeStrokeColor="#0D1117"
                    nodeStrokeWidth={2}
                />
            </ReactFlow>
            </div>
        </section>
      </main>
    </div>
  );
}