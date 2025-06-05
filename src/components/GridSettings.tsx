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
          fontSize: "14px", // FİX 4: Daha küçük başlık
          fontWeight: "600",
          color: "#ffffff",
          marginBottom: "12px", // FİX 4: Daha az margin
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Icons.Settings size={16} /> {/* FİX 4: Daha küçük icon */}
        Grid Settings
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {" "}
        {/* FİX 4: Daha küçük gap */}
        {/* Grid Size - Kompakt */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontWeight: "500",
              fontSize: "11px", // FİX 4: Daha küçük font
              marginBottom: "4px", // FİX 4: Daha az margin
              display: "block",
            }}
          >
            Grid Size: {gridSize}px
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {" "}
            {/* FİX 4: Daha küçük gap */}
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
              style={{
                ...styles.input,
                width: "40px",
                fontSize: "10px",
                padding: "2px 4px",
              }}
            />
          </div>
        </div>
        {/* FİX 4&5: Visibility Toggles - Daha kompakt */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontSize: "11px", // FİX 4: Daha küçük font
              marginBottom: "6px",
              display: "block",
            }}
          >
            Visibility:
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px", // FİX 4: Daha küçük gap
              fontSize: "10px", // FİX 4: Daha küçük font
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input
                type="checkbox"
                id="backgroundVisible"
                checked={backgroundVisible}
                onChange={(e) => setBackgroundVisible(e.target.checked)}
                style={{ width: "10px", height: "10px" }} // FİX 4: Daha küçük checkbox
              />
              <label
                htmlFor="backgroundVisible"
                style={{
                  color: "#ccc",
                  fontWeight: "500",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                Background
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input
                type="checkbox"
                id="gridVisible"
                checked={isGridVisible}
                onChange={(e) => setIsGridVisible(e.target.checked)}
                style={{ width: "10px", height: "10px" }}
              />
              <label
                htmlFor="gridVisible"
                style={{
                  color: "#ccc",
                  fontWeight: "500",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                Grid
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input
                type="checkbox"
                id="labelsVisible"
                checked={labelsVisible}
                onChange={(e) => setLabelsVisible(e.target.checked)}
                style={{ width: "10px", height: "10px" }}
              />
              <label
                htmlFor="labelsVisible"
                style={{
                  color: "#ccc",
                  fontWeight: "500",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                Labels
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input
                type="checkbox"
                id="pathwaysVisible"
                checked={showConnections}
                onChange={(e) => setShowConnections(e.target.checked)}
                style={{ width: "10px", height: "10px" }}
              />
              <label
                htmlFor="pathwaysVisible"
                style={{
                  color: "#ccc",
                  fontWeight: "500",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                Pathways {/* FİX 5: "Connections" yerine "Pathways" */}
              </label>
            </div>
          </div>

          {/* Movement Priority Sub-options - Daha kompakt */}
          {showConnections && (
            <div
              style={{
                marginTop: "6px", // FİX 4: Daha az margin
                paddingLeft: "8px", // FİX 4: Daha az padding
                borderLeft: "2px solid #444",
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "2px", // FİX 4: Daha küçük gap
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <input
                  type="checkbox"
                  id="primaryConnections"
                  checked={showPrimaryConnections}
                  onChange={(e) => setShowPrimaryConnections(e.target.checked)}
                  style={{ width: "9px", height: "9px" }} // FİX 4: Daha küçük
                />
                <label
                  htmlFor="primaryConnections"
                  style={{
                    color: "#10b981",
                    fontSize: "9px",
                    cursor: "pointer",
                  }} // FİX 4: Daha küçük font
                >
                  Primary (4-way)
                </label>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <input
                  type="checkbox"
                  id="secondaryConnections"
                  checked={showSecondaryConnections}
                  onChange={(e) =>
                    setShowSecondaryConnections(e.target.checked)
                  }
                  style={{ width: "9px", height: "9px" }}
                />
                <label
                  htmlFor="secondaryConnections"
                  style={{
                    color: "#10b981",
                    fontSize: "9px",
                    cursor: "pointer",
                  }}
                >
                  Secondary (diagonal)
                </label>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <input
                  type="checkbox"
                  id="cornerIndicators"
                  checked={showCornerIndicators}
                  onChange={(e) => setShowCornerIndicators(e.target.checked)}
                  style={{ width: "9px", height: "9px" }}
                />
                <label
                  htmlFor="cornerIndicators"
                  style={{
                    color: "#ef4444",
                    fontSize: "9px",
                    cursor: "pointer",
                  }}
                >
                  Corner indicators
                </label>
              </div>
            </div>
          )}
        </div>
        {/* Label Size - Daha kompakt */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontWeight: "500",
              fontSize: "11px", // FİX 4: Daha küçük font
              marginBottom: "4px", // FİX 4: Daha az margin
              display: "block",
            }}
          >
            Label Size: {labelSize}px
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
              style={{
                ...styles.input,
                width: "40px",
                fontSize: "10px",
                padding: "2px 4px",
              }} // FİX 4: Daha küçük
            />
          </div>
        </div>
        {/* Grid Alignment - Daha kompakt */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontSize: "11px", // FİX 4: Daha küçük font
              marginBottom: "4px", // FİX 4: Daha az margin
              display: "block",
            }}
          >
            Grid Alignment:
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {" "}
            {/* FİX 4: Daha küçük gap */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{ color: "#ccc", minWidth: "12px", fontSize: "10px" }} // FİX 4: Daha küçük
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
                style={{
                  ...styles.input,
                  width: "35px",
                  fontSize: "9px",
                  padding: "2px 3px",
                }} // FİX 4: Daha küçük
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{ color: "#ccc", minWidth: "12px", fontSize: "10px" }}
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
                style={{
                  ...styles.input,
                  width: "35px",
                  fontSize: "9px",
                  padding: "2px 3px",
                }} // FİX 4: Daha küçük
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
