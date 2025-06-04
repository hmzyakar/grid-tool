import React from "react";
import { Icons } from "./Icons";
import { styles } from "../styles/styles";

interface GridSettingsProps {
  gridSize: number;
  setGridSize: (size: number) => void;
  isGridVisible: boolean;
  setIsGridVisible: (visible: boolean) => void;
  labelsVisible: boolean;
  setLabelsVisible: (visible: boolean) => void;
  backgroundVisible: boolean;
  setBackgroundVisible: (visible: boolean) => void;
  showConnections: boolean;
  setShowConnections: (show: boolean) => void;
  showPrimaryConnections: boolean;
  setShowPrimaryConnections: (show: boolean) => void;
  showSecondaryConnections: boolean;
  setShowSecondaryConnections: (show: boolean) => void;
  showCornerIndicators: boolean;
  setShowCornerIndicators: (show: boolean) => void;
  labelSize: number;
  setLabelSize: (size: number) => void;
  gridOffset: { x: number; y: number };
  setGridOffset: (offset: { x: number; y: number }) => void;
}

export const GridSettings: React.FC<GridSettingsProps> = ({
  gridSize,
  setGridSize,
  isGridVisible,
  setIsGridVisible,
  labelsVisible,
  setLabelsVisible,
  backgroundVisible,
  setBackgroundVisible,
  showConnections,
  setShowConnections,
  showPrimaryConnections,
  setShowPrimaryConnections,
  showSecondaryConnections,
  setShowSecondaryConnections,
  showCornerIndicators,
  setShowCornerIndicators,
  labelSize,
  setLabelSize,
  gridOffset,
  setGridOffset,
}) => {
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
        <Icons.Settings size={18} />
        Grid Settings
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Grid Size */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontWeight: "500",
              fontSize: "14px",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Grid Size: {gridSize}px
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="range"
              min="5"
              max="100"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              style={{ ...styles.range, flex: 1 }}
            />
            <input
              type="number"
              min="1"
              max="200"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              style={{ ...styles.input, width: "60px" }}
            />
          </div>
        </div>

        {/* Visibility Toggles */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="checkbox"
              id="backgroundVisible"
              checked={backgroundVisible}
              onChange={(e) => setBackgroundVisible(e.target.checked)}
              style={{ width: "16px", height: "16px" }}
            />
            <label
              htmlFor="backgroundVisible"
              style={{ color: "#ccc", fontWeight: "500", fontSize: "14px" }}
            >
              Show Background
            </label>
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
              style={{ color: "#ccc", fontWeight: "500", fontSize: "14px" }}
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
              style={{ color: "#ccc", fontWeight: "500", fontSize: "14px" }}
            >
              Show Labels
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="checkbox"
              id="connectionsVisible"
              checked={showConnections}
              onChange={(e) => setShowConnections(e.target.checked)}
              style={{ width: "16px", height: "16px" }}
            />
            <label
              htmlFor="connectionsVisible"
              style={{ color: "#ccc", fontWeight: "500", fontSize: "14px" }}
            >
              Show Connections
            </label>
          </div>

          {/* Movement Priority Sub-options */}
          {showConnections && (
            <div
              style={{
                marginLeft: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  id="primaryConnections"
                  checked={showPrimaryConnections}
                  onChange={(e) => setShowPrimaryConnections(e.target.checked)}
                  style={{ width: "14px", height: "14px" }}
                />
                <label
                  htmlFor="primaryConnections"
                  style={{ color: "#10b981", fontSize: "12px" }}
                >
                  Primary (4-way)
                </label>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  id="secondaryConnections"
                  checked={showSecondaryConnections}
                  onChange={(e) =>
                    setShowSecondaryConnections(e.target.checked)
                  }
                  style={{ width: "14px", height: "14px" }}
                />
                <label
                  htmlFor="secondaryConnections"
                  style={{ color: "#f97316", fontSize: "12px" }}
                >
                  Secondary (diagonal)
                </label>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  id="cornerIndicators"
                  checked={showCornerIndicators}
                  onChange={(e) => setShowCornerIndicators(e.target.checked)}
                  style={{ width: "14px", height: "14px" }}
                />
                <label
                  htmlFor="cornerIndicators"
                  style={{ color: "#ef4444", fontSize: "12px" }}
                >
                  Corner indicators
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Label Size */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontWeight: "500",
              fontSize: "14px",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Label Size: {labelSize}px
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="range"
              min="6"
              max="24"
              value={labelSize}
              onChange={(e) => setLabelSize(Number(e.target.value))}
              style={{ ...styles.range, flex: 1 }}
            />
            <input
              type="number"
              min="6"
              max="48"
              value={labelSize}
              onChange={(e) => setLabelSize(Number(e.target.value))}
              style={{ ...styles.input, width: "60px" }}
            />
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
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                style={{ ...styles.range, flex: 1 }}
              />
              <input
                type="number"
                value={gridOffset.x}
                onChange={(e) =>
                  setGridOffset({ ...gridOffset, x: Number(e.target.value) })
                }
                style={{ ...styles.input, width: "50px" }}
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
                style={{ ...styles.range, flex: 1 }}
              />
              <input
                type="number"
                value={gridOffset.y}
                onChange={(e) =>
                  setGridOffset({ ...gridOffset, y: Number(e.target.value) })
                }
                style={{ ...styles.input, width: "50px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
