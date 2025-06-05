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
          fontSize: "14px", // FİX 4: Daha küçük başlık
          fontWeight: "600",
          color: "#ffffff",
          marginBottom: "12px", // FİX 4: Daha az margin
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Icons.ZoomIn size={16} /> {/* FİX 4: Daha küçük icon */}
        View Controls
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {" "}
        {/* FİX 4: Daha küçük gap */}
        {/* Zoom Control */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontSize: "11px", // FİX 4: Daha küçük font
              marginBottom: "6px", // FİX 4: Daha az margin
              display: "block",
            }}
          >
            Zoom: {Math.round(zoom * 100)}%
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px", // FİX 4: Daha küçük gap
              marginBottom: "6px", // FİX 4: Daha az margin
            }}
          >
            <button
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
              style={{
                ...styles.button,
                padding: "4px 6px", // FİX 4: Daha küçük padding
                fontSize: "10px", // FİX 4: Daha küçük font
              }}
            >
              <Icons.ZoomOut size={12} /> {/* FİX 4: Daha küçük icon */}
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
                padding: "4px 6px", // FİX 4: Daha küçük padding
                fontSize: "10px", // FİX 4: Daha küçük font
              }}
            >
              <Icons.ZoomIn size={12} /> {/* FİX 4: Daha küçük icon */}
            </button>
          </div>

          <div style={{ display: "flex", gap: "4px" }}>
            {" "}
            {/* FİX 4: Daha küçük gap */}
            <button
              onClick={() => setZoom(1)}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                padding: "4px 8px", // FİX 4: Daha küçük padding
                fontSize: "10px", // FİX 4: Daha küçük font
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
                padding: "4px 8px", // FİX 4: Daha küçük padding
                fontSize: "10px", // FİX 4: Daha küçük font
                flex: 1,
              }}
            >
              <Icons.Target size={12} /> {/* FİX 4: Daha küçük icon */}
              Center
            </button>
          </div>
        </div>
        {/* Statistics */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontSize: "11px", // FİX 4: Daha küçük font
              marginBottom: "6px", // FİX 4: Daha az margin
              display: "block",
            }}
          >
            Statistics:
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {" "}
            {/* FİX 4: Daha küçük gap */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {" "}
              {/* FİX 4: Daha küçük gap */}
              <div
                style={{
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  padding: "2px 6px", // FİX 4: Daha küçük padding
                  fontSize: "10px", // FİX 4: Daha küçük font
                  fontWeight: "600",
                  borderRadius: "3px",
                  minWidth: "18px", // FİX 4: Daha küçük width
                  textAlign: "center",
                }}
              >
                {walkwayCount}
              </div>
              <span style={{ color: "#ccc", fontSize: "10px" }}>Walkways</span>{" "}
              {/* FİX 4: Daha küçük font */}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  padding: "2px 6px", // FİX 4: Daha küçük padding
                  fontSize: "10px", // FİX 4: Daha küçük font
                  fontWeight: "600",
                  borderRadius: "3px",
                  minWidth: "18px", // FİX 4: Daha küçük width
                  textAlign: "center",
                }}
              >
                {poiCount}
              </div>
              <span style={{ color: "#ccc", fontSize: "10px" }}>POIs</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  padding: "2px 6px", // FİX 4: Daha küçük padding
                  fontSize: "10px", // FİX 4: Daha küçük font
                  fontWeight: "600",
                  borderRadius: "3px",
                  minWidth: "18px", // FİX 4: Daha küçük width
                  textAlign: "center",
                }}
              >
                {connectionCount}
              </div>
              <span style={{ color: "#ccc", fontSize: "10px" }}>
                Vertical Connections {/* FİX 5: Daha açık isim */}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  padding: "2px 6px", // FİX 4: Daha küçük padding
                  fontSize: "10px", // FİX 4: Daha küçük font
                  fontWeight: "600",
                  borderRadius: "3px",
                  minWidth: "18px", // FİX 4: Daha küçük width
                  textAlign: "center",
                }}
              >
                {cellLabels.size}
              </div>
              <span style={{ color: "#ccc", fontSize: "10px" }}>Labeled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
