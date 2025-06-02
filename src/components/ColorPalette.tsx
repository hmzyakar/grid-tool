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
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  paintColor,
  setPaintColor,
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
              }}
              title={color.name}
            />
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
        <div
          style={{
            backgroundColor: "#333",
            padding: "8px 16px",
            border: "1px solid #555",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#ffffff",
            }}
          >
            Selected:{" "}
            {colors.find((c) => c.value === paintColor)?.name || paintColor}
          </span>
        </div>
      </div>
    </div>
  );
};
