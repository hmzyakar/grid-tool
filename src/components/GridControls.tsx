import React from "react";
import { Icons } from "./Icons";
import { styles } from "../styles/styles";

interface GridControlsProps {
  gridSize: number;
  setGridSize: (size: number) => void;
  isGridVisible: boolean;
  setIsGridVisible: (visible: boolean) => void;
  labelsVisible: boolean;
  setLabelsVisible: (visible: boolean) => void;
  gridOffset: { x: number; y: number };
  setGridOffset: (offset: { x: number; y: number }) => void;
  paintedCells: Map<string, string>;
  cellLabels: Map<string, string[]>;
  zoom: number;
  setZoom: (zoom: number) => void;
  centerView: () => void;
  labelSize: number;
  setLabelSize: (size: number) => void;
}

export const GridControls: React.FC<GridControlsProps> = ({
  gridSize,
  setGridSize,
  isGridVisible,
  setIsGridVisible,
  labelsVisible,
  setLabelsVisible,
  gridOffset,
  setGridOffset,
  paintedCells,
  cellLabels,
  zoom,
  setZoom,
  centerView,
  labelSize,
  setLabelSize,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "20px",
      }}
    >
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
          <Icons.Settings size={18} />
          Grid Settings
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <label
              style={{ color: "#ccc", fontWeight: "500", minWidth: "80px" }}
            >
              Grid Size:
            </label>
            <input
              type="range"
              min="1"
              max="300"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              style={styles.range}
            />
            <input
              type="number"
              min="1"
              max="500"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              style={{ ...styles.input, width: "70px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="checkbox"
              id="gridVisible"
              checked={isGridVisible}
              onChange={(e) => setIsGridVisible(e.target.checked)}
              style={{ width: "16px", height: "16px" }}
            />
            <label
              htmlFor="gridVisible"
              style={{ color: "#ccc", fontWeight: "500" }}
            >
              Show Grid
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="checkbox"
              id="labelsVisible"
              checked={labelsVisible}
              onChange={(e) => setLabelsVisible(e.target.checked)}
              style={{ width: "16px", height: "16px" }}
            />
            <label
              htmlFor="labelsVisible"
              style={{ color: "#ccc", fontWeight: "500" }}
            >
              Show Labels
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <label
              style={{ color: "#ccc", fontWeight: "500", minWidth: "80px" }}
            >
              Label Size:
            </label>
            <input
              type="range"
              min="1"
              max="24"
              value={labelSize}
              onChange={(e) => setLabelSize(Number(e.target.value))}
              style={styles.range}
            />
            <input
              type="number"
              min="1"
              max="48"
              value={labelSize}
              onChange={(e) => setLabelSize(Number(e.target.value))}
              style={{ ...styles.input, width: "60px" }}
            />
          </div>
        </div>
      </div>

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
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                max="10"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={styles.range}
              />
              <button
                onClick={() => setZoom(Math.min(10, zoom + 0.1))}
                style={{
                  ...styles.button,
                  padding: "6px 8px",
                  fontSize: "12px",
                }}
              >
                <Icons.ZoomIn size={14} />
              </button>
              <button
                onClick={() => setZoom(1)}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  padding: "6px 12px",
                  fontSize: "12px",
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
                }}
              >
                <Icons.Target size={14} />
                Center
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "14px",
            }}
          >
            <div
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                padding: "4px 12px",
              }}
            >
              Painted: {paintedCells.size}
            </div>
            <div
              style={{
                backgroundColor: "#16a34a",
                color: "#fff",
                padding: "4px 12px",
              }}
            >
              Labeled: {cellLabels.size}
            </div>
          </div>

          {/* Grid Alignment */}
          <div>
            <label
              style={{
                color: "#ccc",
                fontSize: "14px",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Grid Alignment:
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{ color: "#ccc", minWidth: "20px", fontSize: "12px" }}
              >
                X:
              </span>
              <input
                type="range"
                min={-gridSize}
                max={gridSize}
                value={gridOffset.x}
                onChange={(e) =>
                  setGridOffset({ ...gridOffset, x: Number(e.target.value) })
                }
                style={styles.range}
              />
              <input
                type="number"
                value={gridOffset.x}
                onChange={(e) =>
                  setGridOffset({ ...gridOffset, x: Number(e.target.value) })
                }
                style={{ ...styles.input, width: "60px" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{ color: "#ccc", minWidth: "20px", fontSize: "12px" }}
              >
                Y:
              </span>
              <input
                type="range"
                min={-gridSize}
                max={gridSize}
                value={gridOffset.y}
                onChange={(e) =>
                  setGridOffset({ ...gridOffset, y: Number(e.target.value) })
                }
                style={styles.range}
              />
              <input
                type="number"
                value={gridOffset.y}
                onChange={(e) =>
                  setGridOffset({ ...gridOffset, y: Number(e.target.value) })
                }
                style={{ ...styles.input, width: "60px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
