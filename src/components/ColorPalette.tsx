import React from "react";
import { Icons } from "./Icons";
import { styles } from "../styles/styles";
import { POI_CATEGORIES } from "../utils/constants";

export interface Color {
  name: string;
  value: string;
  category?: string;
  defaultLabel?: string;
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
        Paint Colors
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Paint Colors - Vertical Compact Layout */}
        <div>
          <label
            style={{
              color: "#ccc",
              fontSize: "14px",
              marginBottom: "8px",
              display: "block",
            }}
          >
            Select Color:
          </label>

          {/* Navigation Colors - Single Column Compact */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              backgroundColor: "#333",
              padding: "8px",
              border: "1px solid #555",
              marginBottom: "8px",
            }}
          >
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setPaintColor(color.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 8px",
                  border:
                    paintColor === color.value
                      ? "2px solid #ffffff"
                      : "1px solid #666",
                  backgroundColor: "#404040",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "500",
                  color: "#ffffff",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
                title={`${color.name}${
                  colorPresets.has(color.value) ? " (Has preset)" : ""
                }`}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: color.value,
                    border: "1px solid rgba(255,255,255,0.3)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "500",
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  {color.name}
                </span>

                {colorPresets.has(color.value) && (
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      backgroundColor: "#ffd700",
                      borderRadius: "50%",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Custom Color + Create Preset */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                type="color"
                value={paintColor}
                onChange={(e) => setPaintColor(e.target.value)}
                style={{
                  width: "32px",
                  height: "24px",
                  border: "1px solid #666",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                }}
                title="Custom Color"
              />

              <button
                onClick={onCreatePreset}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  fontSize: "10px",
                  padding: "6px 8px",
                  flex: 1,
                }}
              >
                <Icons.Tag size={12} />
                Preset
              </button>
            </div>
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
            <span style={{ color: "#ccc", fontSize: "12px" }}>
              {labelColor}
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
              flexDirection: "column",
              gap: "6px",
              fontSize: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontWeight: "500",
                  color: "#ffffff",
                  fontSize: "12px",
                }}
              >
                Paint:{" "}
                {colors.find((c) => c.value === paintColor)?.name || paintColor}
              </span>
              {colorPresets.has(paintColor) && (
                <span style={{ color: "#ffd700", fontSize: "11px" }}>
                  Preset
                </span>
              )}
            </div>

            {colorPresets.has(paintColor) && (
              <div style={{ color: "#ffd700", fontSize: "11px" }}>
                Labels: {colorPresets.get(paintColor)?.join(", ")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
