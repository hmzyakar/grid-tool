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
  cellLabels: Map<string, string>;
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
          Statistics
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
