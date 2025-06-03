import React from "react";
import { Icons } from "./Icons";
import { styles } from "../styles/styles";

export interface Color {
  name: string;
  value: string;
}

interface ColorPaletteProps {
  colors: Color[];
  paintColor: string;
  setPaintColor: (color: string) => void;
  labelColor: string;
  setLabelColor: (color: string) => void;
  onCreatePreset: () => void;
  colorPresets: Map<string, string[]>;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  paintColor,
  setPaintColor,
  labelColor,
  setLabelColor,
  onCreatePreset,
  colorPresets,
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
        <Icons.Palette size={18} />
        Color Palette
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Paint Colors */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontSize: "14px",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Paint Color:
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "6px",
                backgroundColor: "#333",
                padding: "8px",
                border: "1px solid #555",
              }}
            >
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setPaintColor(color.value)}
                  style={{
                    width: "32px",
                    height: "32px",
                    border:
                      paintColor === color.value
                        ? "2px solid #ffffff"
                        : "1px solid #666",
                    backgroundColor: color.value,
                    cursor: "pointer",
                    transform:
                      paintColor === color.value ? "scale(1.1)" : "scale(1)",
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                  title={`${color.name}${
                    colorPresets.has(color.value) ? " (Has preset)" : ""
                  }`}
                >
                  {colorPresets.has(color.value) && (
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "2px",
                        width: "6px",
                        height: "6px",
                        backgroundColor: "#ffd700",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </button>
              ))}
              <input
                type="color"
                value={paintColor}
                onChange={(e) => setPaintColor(e.target.value)}
                style={{
                  width: "32px",
                  height: "32px",
                  border: "1px solid #666",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                }}
                title="Custom Color"
              />
            </div>

            <button
              onClick={onCreatePreset}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                fontSize: "12px",
                padding: "8px 12px",
              }}
            >
              <Icons.Tag size={14} />
              Create Preset
            </button>
          </div>
        </div>

        {/* Label Color */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontSize: "14px",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Label Color:
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="color"
              value={labelColor}
              onChange={(e) => setLabelColor(e.target.value)}
              style={{
                width: "40px",
                height: "32px",
                border: "1px solid #666",
                cursor: "pointer",
                backgroundColor: "transparent",
              }}
            />
            <span style={{ color: "#ccc", fontSize: "14px" }}>
              Selected: {labelColor}
            </span>
          </div>
        </div>

        {/* Current Selection Info */}
        <div
          style={{
            backgroundColor: "#333",
            padding: "12px",
            border: "1px solid #555",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
            }}
          >
            <span style={{ fontWeight: "500", color: "#ffffff" }}>
              Paint:{" "}
              {colors.find((c) => c.value === paintColor)?.name || paintColor}
            </span>
            {colorPresets.has(paintColor) && (
              <span style={{ color: "#ffd700", fontSize: "12px" }}>
                Preset: {colorPresets.get(paintColor)?.join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
