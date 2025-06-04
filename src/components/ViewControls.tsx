import React from "react";
import { Icons } from "./Icons";
import { styles } from "../styles/styles";

interface ViewControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  centerView: () => void;
  paintedCells: Map<string, string>;
  cellLabels: Map<string, string[]>;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  zoom,
  setZoom,
  centerView,
  paintedCells,
  cellLabels,
}) => {
  const walkwayCount = Array.from(paintedCells.entries()).filter(
    ([_, color]) => color === "#16a34a"
  ).length;
  const poiCount = Array.from(paintedCells.entries()).filter(
    ([_, color]) => color === "#dc2626"
  ).length;
  const connectionCount = Array.from(paintedCells.entries()).filter(
    ([_, color]) => ["#2563eb", "#ea580c", "#7c3aed"].includes(color)
  ).length;

  return (
    <div style={styles.section}>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#ffffff",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Icons.ZoomIn size={18} />
        View Controls
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Zoom Control */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontSize: "14px",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Zoom: {Math.round(zoom * 100)}%
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <button
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
              style={{
                ...styles.button,
                padding: "6px 8px",
                fontSize: "12px",
              }}
            >
              <Icons.ZoomOut size={14} />
            </button>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ ...styles.range, flex: 1 }}
            />
            <button
              onClick={() => setZoom(Math.min(5, zoom + 0.1))}
              style={{
                ...styles.button,
                padding: "6px 8px",
                fontSize: "12px",
              }}
            >
              <Icons.ZoomIn size={14} />
            </button>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setZoom(1)}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                padding: "6px 12px",
                fontSize: "12px",
                flex: 1,
              }}
            >
              Reset
            </button>
            <button
              onClick={centerView}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                padding: "6px 12px",
                fontSize: "12px",
                flex: 1,
              }}
            >
              <Icons.Target size={14} />
              Center
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontSize: "14px",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Statistics:
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: "600",
                  borderRadius: "3px",
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {walkwayCount}
              </div>
              <span style={{ color: "#ccc", fontSize: "12px" }}>Walkways</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: "600",
                  borderRadius: "3px",
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {poiCount}
              </div>
              <span style={{ color: "#ccc", fontSize: "12px" }}>POIs</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: "600",
                  borderRadius: "3px",
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {connectionCount}
              </div>
              <span style={{ color: "#ccc", fontSize: "12px" }}>
                Connections
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: "600",
                  borderRadius: "3px",
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {cellLabels.size}
              </div>
              <span style={{ color: "#ccc", fontSize: "12px" }}>Labeled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
