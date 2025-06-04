import React, { useState } from "react";
import { Icons } from "./Icons";
import { styles } from "../styles/styles";
import { FloorData } from "../utils/constants";

interface FloorManagementProps {
  currentFloor: { name: string; number: number } | null;
  floors: Map<string, FloorData>;
  onCreateFloor: (name: string, number: number) => void;
  onSwitchFloor: (floorKey: string) => void;
  onDeleteFloor: (floorKey: string) => void;
  paintedCells: Map<string, string>;
  cellLabels: Map<string, string[]>;
}

export const FloorManagement: React.FC<FloorManagementProps> = ({
  currentFloor,
  floors,
  onCreateFloor,
  onSwitchFloor,
  onDeleteFloor,
  paintedCells,
  cellLabels,
}) => {
  const [newFloorName, setNewFloorName] = useState("");
  const [newFloorNumber, setNewFloorNumber] = useState(0);

  const handleCreateFloor = () => {
    if (newFloorName.trim()) {
      onCreateFloor(newFloorName.trim(), newFloorNumber);
      setNewFloorName("");
      setNewFloorNumber(newFloorNumber + 1);
    }
  };

  const handleDeleteCurrentFloor = () => {
    if (currentFloor) {
      const currentKey = `${currentFloor.number}_${currentFloor.name}`;
      onDeleteFloor(currentKey);
    }
  };

  if (floors.size === 0) {
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
          🏢 Floor Management
        </h3>

        <div style={{ textAlign: "center", padding: "20px" }}>
          <p style={{ color: "#888", marginBottom: "20px", fontSize: "14px" }}>
            No floors created yet
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <input
              type="text"
              placeholder="Floor name (e.g., Ground Floor)"
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              style={{ ...styles.input, width: "100%" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                placeholder="Number"
                value={newFloorNumber}
                onChange={(e) => setNewFloorNumber(Number(e.target.value))}
                style={{ ...styles.input, width: "80px" }}
              />
              <button
                onClick={handleCreateFloor}
                disabled={!newFloorName.trim()}
                style={{
                  ...styles.button,
                  ...styles.successButton,
                  flex: 1,
                  fontSize: "14px",
                  opacity: !newFloorName.trim() ? 0.5 : 1,
                }}
              >
                <Icons.Plus size={16} />
                Create First Floor
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        🏢 Floor Management
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Current Floor Info */}
        {currentFloor && (
          <div
            style={{
              backgroundColor: "#1f2937",
              padding: "12px",
              border: "1px solid #374151",
              borderLeft: "4px solid #10b981",
            }}
          >
            <div
              style={{
                color: "#10b981",
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              CURRENT FLOOR
            </div>
            <div
              style={{ color: "#ffffff", fontSize: "14px", fontWeight: "500" }}
            >
              {currentFloor.name} (#{currentFloor.number})
            </div>
            <div style={{ color: "#9ca3af", fontSize: "12px" }}>
              {paintedCells.size} cells painted, {cellLabels.size} labeled
            </div>
          </div>
        )}

        {/* Create New Floor */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontSize: "14px",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Create New Floor:
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <input
              type="text"
              placeholder="Floor name"
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              style={{ ...styles.input, width: "100%" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                placeholder="Number"
                value={newFloorNumber}
                onChange={(e) => setNewFloorNumber(Number(e.target.value))}
                style={{ ...styles.input, width: "80px" }}
              />
              <button
                onClick={handleCreateFloor}
                disabled={!newFloorName.trim()}
                style={{
                  ...styles.button,
                  ...styles.successButton,
                  flex: 1,
                  fontSize: "12px",
                  opacity: !newFloorName.trim() ? 0.5 : 1,
                }}
              >
                <Icons.Plus size={14} />
                Create
              </button>
            </div>
          </div>
        </div>

        {/* Switch Floor */}
        {floors.size > 1 && currentFloor && (
          <div>
            <label
              style={{
                color: "#ccc",
                fontSize: "14px",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Switch Floor:
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                onChange={(e) => onSwitchFloor(e.target.value)}
                value={`${currentFloor.number}_${currentFloor.name}`}
                style={{ ...styles.input, flex: 1 }}
              >
                {Array.from(floors.entries())
                  .sort(([, a], [, b]) => a.number - b.number)
                  .map(([key, floor]) => (
                    <option key={key} value={key}>
                      {floor.name} (#{floor.number})
                    </option>
                  ))}
              </select>

              {floors.size > 1 && (
                <button
                  onClick={handleDeleteCurrentFloor}
                  style={{
                    ...styles.button,
                    ...styles.dangerButton,
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                  title="Delete current floor"
                >
                  <Icons.X size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
