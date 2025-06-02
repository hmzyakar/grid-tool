import React from "react";
import { Icons } from "./Icons";
import { styles } from "../styles/styles";

interface ZoomControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  resetZoom: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  setZoom,
  resetZoom,
}) => {
  const zoomIn = () => setZoom(Math.min(5, zoom + 0.2));
  const zoomOut = () => setZoom(Math.max(0.2, zoom - 0.2));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
        backgroundColor: "#262626",
        padding: "12px",
        border: "1px solid #404040",
      }}
    >
      <span style={{ color: "#ccc", fontSize: "14px", fontWeight: "500" }}>
        Zoom:
      </span>
      <button onClick={zoomOut} style={{ ...styles.button, padding: "8px" }}>
        <Icons.ZoomOut size={16} />
      </button>
      <input
        type="range"
        min="0.2"
        max="5"
        step="0.1"
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        style={styles.range}
      />
      <button onClick={zoomIn} style={{ ...styles.button, padding: "8px" }}>
        <Icons.ZoomIn size={16} />
      </button>
      <span style={{ color: "#ccc", fontSize: "14px", minWidth: "50px" }}>
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={resetZoom}
        style={{
          ...styles.button,
          ...styles.primaryButton,
          padding: "8px 12px",
        }}
      >
        Reset
      </button>
    </div>
  );
};
