import React from "react";
import { Icons } from "./Icons";
import { styles } from "../styles/styles";

interface ViewControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  centerView: () => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  zoom,
  setZoom,
  centerView,
}) => {
  return (
    <div style={styles.section}>
      <h3
        style={{
          fontSize: "16px", // Bigger header
          fontWeight: "600",
          color: "#ffffff",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Icons.ZoomIn size={18} />
        View Controls
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Zoom Control - More readable */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontSize: "13px", // Bigger font
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
                fontSize: "11px",
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
                fontSize: "11px",
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
                padding: "6px 10px",
                fontSize: "11px",
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
                padding: "6px 10px",
                fontSize: "11px",
                flex: 1,
              }}
            >
              <Icons.Target size={14} />
              Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
