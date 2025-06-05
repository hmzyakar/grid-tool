import React, { useState } from "react";
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
  // FİX 4: Custom colors state
  const [customColors, setCustomColors] = useState<Color[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorValue, setNewColorValue] = useState("#000000");
  const [showAddColorForm, setShowAddColorForm] = useState(false);

  // FİX 4: Add custom color function
  const handleAddCustomColor = () => {
    if (newColorName.trim()) {
      const newColor: Color = {
        name: newColorName.trim(),
        value: newColorValue,
        category: "custom",
      };

      setCustomColors((prev) => [...prev, newColor]);
      setNewColorName("");
      setNewColorValue("#000000");
      setShowAddColorForm(false);
      setPaintColor(newColorValue); // Auto-select the new color
    }
  };

  // FİX 4: Remove custom color function
  const handleRemoveCustomColor = (colorToRemove: Color) => {
    setCustomColors((prev) =>
      prev.filter(
        (color) =>
          !(
            color.name === colorToRemove.name &&
            color.value === colorToRemove.value
          )
      )
    );
  };

  // Combine default colors with custom colors
  const allColors = [...colors, ...customColors];

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
        {/* Paint Colors - Vertical Compact Layout with Scroll */}
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

          {/* Color List with Scroll */}
          <div
            style={{
              backgroundColor: "#333",
              border: "1px solid #555",
              maxHeight: "240px", // FİX 6: Daha küçük max height
              overflowY: "auto", // FİX 6: Enable vertical scroll
              marginBottom: "8px",
            }}
          >
            {/* Default Navigation Colors */}
            <div style={{ padding: "8px" }}>
              <div
                style={{
                  color: "#10b981",
                  fontSize: "11px",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                NAVIGATION COLORS
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
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
            </div>

            {/* FİX 4: Custom Colors Section */}
            {customColors.length > 0 && (
              <div style={{ padding: "8px", borderTop: "1px solid #555" }}>
                <div
                  style={{
                    color: "#fbbf24",
                    fontSize: "11px",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  CUSTOM COLORS
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {customColors.map((color, index) => (
                    <div
                      key={`${color.value}-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        position: "relative",
                      }}
                    >
                      <button
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
                          flex: 1,
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

                      {/* Remove button for custom colors */}
                      <button
                        onClick={() => handleRemoveCustomColor(color)}
                        style={{
                          backgroundColor: "#dc2626",
                          border: "1px solid #b91c1c",
                          color: "#ffffff",
                          padding: "4px",
                          cursor: "pointer",
                          fontSize: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Remove custom color"
                      >
                        <Icons.X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FİX 4: Custom Color + Create Preset + Add Custom */}
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
                title="Pick Custom Color"
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

              {/* FİX 4: Add Custom Color Button */}
              <button
                onClick={() => setShowAddColorForm(!showAddColorForm)}
                style={{
                  ...styles.button,
                  backgroundColor: showAddColorForm ? "#fbbf24" : "#ea580c",
                  borderColor: showAddColorForm ? "#f59e0b" : "#c2410c",
                  fontSize: "10px",
                  padding: "6px 8px",
                }}
                title="Add Custom Color"
              >
                <Icons.Plus size={12} />
              </button>
            </div>

            {/* FİX 4: Add Custom Color Form */}
            {showAddColorForm && (
              <div
                style={{
                  backgroundColor: "#1f2937",
                  padding: "12px",
                  border: "1px solid #374151",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    color: "#fbbf24",
                    fontSize: "11px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  ADD CUSTOM COLOR
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Color name"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    style={{
                      ...styles.input,
                      fontSize: "11px",
                      padding: "6px 8px",
                      width: "100%",
                    }}
                  />
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="color"
                      value={newColorValue}
                      onChange={(e) => setNewColorValue(e.target.value)}
                      style={{
                        width: "40px",
                        height: "28px",
                        border: "1px solid #666",
                        cursor: "pointer",
                        backgroundColor: "transparent",
                      }}
                    />
                    <button
                      onClick={handleAddCustomColor}
                      disabled={!newColorName.trim()}
                      style={{
                        ...styles.button,
                        ...styles.successButton,
                        fontSize: "11px",
                        padding: "6px 12px",
                        flex: 1,
                        opacity: !newColorName.trim() ? 0.5 : 1,
                      }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddColorForm(false)}
                      style={{
                        ...styles.button,
                        fontSize: "11px",
                        padding: "6px 8px",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                {allColors.find((c) => c.value === paintColor)?.name ||
                  paintColor}
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
