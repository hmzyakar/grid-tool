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
  // FİX 1: Floor silme onayı için state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCreateFloor = () => {
    if (newFloorName.trim()) {
      onCreateFloor(newFloorName.trim(), newFloorNumber);
      setNewFloorName("");
      setNewFloorNumber(newFloorNumber + 1);
    }
  };

  // FİX 1: Floor silme onayı
  const handleDeleteRequest = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (currentFloor) {
      const currentKey = `${currentFloor.number}_${currentFloor.name}`;
      onDeleteFloor(currentKey);
    }
    setShowDeleteConfirm(false);
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
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Floor name (e.g., Ground Floor)"
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              style={{ ...styles.input, minWidth: "200px" }}
            />
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
    );
  }

  return (
    <>
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

        {/* FİX 7: Daha compact layout, centered */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Current Floor Info - Compact */}
          {currentFloor && (
            <div
              style={{
                backgroundColor: "#1f2937",
                padding: "8px 12px",
                border: "1px solid #374151",
                borderLeft: "4px solid #10b981",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  color: "#10b981",
                  fontSize: "10px",
                  fontWeight: "600",
                  marginBottom: "2px",
                }}
              >
                CURRENT
              </div>
              <div
                style={{
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "500",
                  marginBottom: "1px",
                }}
              >
                {currentFloor.name} (#{currentFloor.number})
              </div>
              <div style={{ color: "#9ca3af", fontSize: "10px" }}>
                {paintedCells.size} painted, {cellLabels.size} labeled
              </div>
            </div>
          )}

          {/* Create New Floor - Compact */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Floor name"
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              style={{
                ...styles.input,
                width: "140px",
                fontSize: "13px",
                padding: "6px 8px",
              }}
            />
            <input
              type="number"
              placeholder="#"
              value={newFloorNumber}
              onChange={(e) => setNewFloorNumber(Number(e.target.value))}
              style={{
                ...styles.input,
                width: "50px",
                fontSize: "13px",
                padding: "6px 8px",
              }}
            />
            <button
              onClick={handleCreateFloor}
              disabled={!newFloorName.trim()}
              style={{
                ...styles.button,
                ...styles.successButton,
                fontSize: "11px",
                padding: "6px 10px",
                opacity: !newFloorName.trim() ? 0.5 : 1,
              }}
            >
              <Icons.Plus size={12} />
              Create
            </button>
          </div>

          {/* Switch Floor and Delete - Compact */}
          {floors.size >= 1 && currentFloor && (
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {floors.size > 1 ? (
                <select
                  onChange={(e) => onSwitchFloor(e.target.value)}
                  value={`${currentFloor.number}_${currentFloor.name}`}
                  style={{
                    ...styles.input,
                    minWidth: "120px",
                    fontSize: "12px",
                    padding: "6px 8px",
                  }}
                >
                  {Array.from(floors.entries())
                    .sort(([, a], [, b]) => a.number - b.number)
                    .map(([key, floor]) => (
                      <option key={key} value={key}>
                        {floor.name} (#{floor.number})
                      </option>
                    ))}
                </select>
              ) : (
                <div
                  style={{
                    ...styles.input,
                    minWidth: "120px",
                    fontSize: "12px",
                    padding: "6px 8px",
                    backgroundColor: "#1a1a1a",
                    color: "#888",
                  }}
                >
                  {currentFloor.name} (#{currentFloor.number})
                </div>
              )}

              {/* FİX 1: Delete button with confirmation */}
              <button
                onClick={handleDeleteRequest}
                style={{
                  ...styles.button,
                  ...styles.dangerButton,
                  fontSize: "11px",
                  padding: "6px 8px",
                }}
                title="Delete current floor"
              >
                <Icons.X size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FİX 1: Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "16px",
              }}
            >
              Delete Floor
            </h3>
            <p style={{ color: "#ccc", marginBottom: "20px" }}>
              Are you sure you want to delete floor "{currentFloor?.name}"?
              <br />
              <span style={{ color: "#ef4444" }}>
                This action cannot be undone and will delete all painted cells
                and labels on this floor.
              </span>
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={styles.button}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{ ...styles.button, ...styles.dangerButton }}
              >
                Delete Floor
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
