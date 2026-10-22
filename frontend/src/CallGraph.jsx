
import { useMemo, useState } from "react";

export default function CallGraph({ graph }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];

  const layout = useMemo(() => {
    const width = 900;
    const height = 460;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width * 0.38, height * 0.37);

    const positioned = nodes.map((node, index) => {
      const angle = (2 * Math.PI * index) / Math.max(nodes.length, 1) - Math.PI / 2;

      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    const byId = new Map(positioned.map((node) => [node.id, node]));

    return { positioned, byId, width, height };
  }, [nodes]);

  const selected = layout.byId.get(selectedNode);

  return (
    <section
      style={{
        marginBottom: 24,
        padding: 20,
        background: "#161B22",
        border: "1px solid #30363D",
        borderRadius: 12,
        color: "#E6EDF3",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 6px" }}>Call graph</h3>
          <p style={{ color: "#8B949E", fontSize: 13, margin: 0 }}>
            Explore how functions and classes connect.
          </p>
        </div>

        <div style={{ color: "#8B949E", fontSize: 12 }}>
          {nodes.length} nodes · {edges.length} edges
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          overflowX: "auto",
          border: "1px solid #30363D",
          borderRadius: 10,
          background: "#0D1117",
        }}
      >
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          style={{ display: "block", width: "100%", minWidth: 620 }}
          role="img"
          aria-label="Interactive repository call graph"
        >
          <defs>
            <marker
              id="call-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#58A6FF" />
            </marker>
          </defs>

          {edges.map((edge, index) => {
            const source = layout.byId.get(edge.source);
            const target = layout.byId.get(edge.target);

            if (!source || !target) return null;

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const length = Math.hypot(dx, dy) || 1;
            const nodeHalfWidth = 75;
            const nodeHalfHeight = 31;

            const startOffset =
            Math.min(
                nodeHalfWidth / Math.max(Math.abs(dx / length), 0.001),
                nodeHalfHeight / Math.max(Math.abs(dy / length), 0.001)
            );

            const endOffset = startOffset;

            const x1 = source.x + (dx / length) * startOffset;
            const y1 = source.y + (dy / length) * startOffset;
            const x2 = target.x - (dx / length) * endOffset;
            const y2 = target.y - (dy / length) * endOffset;

            const isHighlighted =
              !selectedNode ||
              edge.source === selectedNode ||
              edge.target === selectedNode;

            return (
              <line
                key={`${edge.source}-${edge.target}-${index}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isHighlighted ? "#58A6FF" : "#30363D"}
                strokeWidth={isHighlighted ? 1.5 : 1}
                opacity={isHighlighted ? 0.8 : 0.2}
                markerEnd="url(#call-arrow)"
              />
            );
          })}

          {layout.positioned.map((node) => {
            const active = selectedNode === node.id;
            const connected = edges.some(
              (edge) =>
                (edge.source === node.id || edge.target === node.id) &&
                (!selectedNode ||
                  edge.source === selectedNode ||
                  edge.target === selectedNode)
            );

            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={`Select ${node.name}`}
                onClick={() =>
                  setSelectedNode(active ? null : node.id)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedNode(active ? null : node.id);
                  }
                }}
                style={{ cursor: "pointer", outline: "none" }}
              >
                <rect
                  x={node.x - 75}
                  y={node.y - 31}
                  width="150"
                  height="62"
                  rx="10"
                  fill={active ? "#1F3B59" : "#161B22"}
                  stroke={active ? "#79C0FF" : "#30363D"}
                  strokeWidth={active ? 2 : 1}
                  opacity={selectedNode && !active && !connected ? 0.35 : 1}
                />
                <text
                    x={node.x}
                    y={node.y - 5}
                    fill={active ? "#FFFFFF" : "#C9D1D9"}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    pointerEvents="none"
                    >
                    {node.name.length > 17
                        ? `${node.name.slice(0, 15)}…`
                        : node.name}

                    <tspan
                        x={node.x}
                        y={node.y + 15}
                        fill="#8B949E"
                        fontSize="9"
                        fontWeight="400"
                    >
                        {(node.file || "").split("/").pop() || "module"}
                    </tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p style={{ color: "#8B949E", fontSize: 12, margin: "12px 0 0" }}>
        Select a node to highlight its connections. Select it again to reset.
      </p>

      {selected && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 8,
            background: "#0D1117",
            border: "1px solid #30363D",
          }}
        >
          <div style={{ color: "#79C0FF", fontWeight: 600 }}>
            {selected.name}
          </div>
          <div
            style={{
              color: "#8B949E",
              fontSize: 12,
              marginTop: 6,
              overflowWrap: "anywhere",
            }}
          >
            {selected.file || selected.id}
          </div>
          <div style={{ fontSize: 13, marginTop: 10 }}>
            Outgoing calls:{" "}
            {edges.filter((edge) => edge.source === selected.id).length}
            {" · "}
            Incoming calls:{" "}
            {edges.filter((edge) => edge.target === selected.id).length}
          </div>
        </div>
      )}
    </section>
  );
}