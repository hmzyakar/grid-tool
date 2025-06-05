import React from "react";

export const styles = {
  globalContainer: {
    margin: 0,
    padding: 0,
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    color: "#ffffff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    boxSizing: "border-box",
    width: "100%",
    overflowX: "hidden",
  } as React.CSSProperties,

  container: {
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    color: "#ffffff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    margin: 0,
    padding: 0,
    width: "100%",
    overflowX: "hidden",
  } as React.CSSProperties,

  mainCard: {
    maxWidth: "1800px", // Expanded for navigation tool
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    minHeight: "100vh",
    boxSizing: "border-box",
    width: "100%",
  } as React.CSSProperties,

  title: {
    textAlign: "center" as const,
    marginBottom: "32px",
  } as React.CSSProperties,

  section: {
    backgroundColor: "#262626",
    padding: "20px",
    border: "1px solid #404040",
    marginBottom: "20px",
    boxSizing: "border-box",
  } as React.CSSProperties,

  // NEW: Floor management section styling
  floorSection: {
    backgroundColor: "#1f2937",
    padding: "16px",
    border: "1px solid #374151",
    borderLeft: "4px solid #10b981",
    marginBottom: "16px",
    boxSizing: "border-box",
  } as React.CSSProperties,

  currentFloorIndicator: {
    backgroundColor: "#064e3b",
    padding: "8px 12px",
    border: "1px solid #10b981",
    color: "#10b981",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px",
  } as React.CSSProperties,

  button: {
    backgroundColor: "#404040",
    color: "#ffffff",
    padding: "12px 20px",
    border: "1px solid #555",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxSizing: "border-box",
    borderRadius: "4px", // Added border radius for better UI
  } as React.CSSProperties,

  primaryButton: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
  } as React.CSSProperties,

  dangerButton: {
    backgroundColor: "#dc2626",
    borderColor: "#b91c1c",
  } as React.CSSProperties,

  successButton: {
    backgroundColor: "#16a34a",
    borderColor: "#15803d",
  } as React.CSSProperties,

  warningButton: {
    backgroundColor: "#ea580c",
    borderColor: "#c2410c",
  } as React.CSSProperties,

  // NEW: Navigation-specific button styles
  walkwayButton: {
    backgroundColor: "#16a34a",
    borderColor: "#15803d",
    color: "#ffffff",
  } as React.CSSProperties,

  poiButton: {
    backgroundColor: "#dc2626",
    borderColor: "#b91c1c",
    color: "#ffffff",
  } as React.CSSProperties,

  connectionButton: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
    color: "#ffffff",
  } as React.CSSProperties,

  input: {
    padding: "8px 12px",
    border: "1px solid #555",
    backgroundColor: "#333",
    color: "#fff",
    fontSize: "14px",
    boxSizing: "border-box",
    borderRadius: "4px", // Added border radius
  } as React.CSSProperties,

  select: {
    padding: "8px 12px",
    border: "1px solid #555",
    backgroundColor: "#333",
    color: "#fff",
    fontSize: "14px",
    boxSizing: "border-box",
    borderRadius: "4px",
    cursor: "pointer",
  } as React.CSSProperties,

  range: {
    flex: 1,
    height: "6px",
    backgroundColor: "#404040",
    outline: "none",
    cursor: "pointer",
    borderRadius: "3px", // Added border radius
  } as React.CSSProperties,

  modal: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: "16px",
    boxSizing: "border-box",
  } as React.CSSProperties,

  modalContent: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #404040",
    padding: "32px",
    width: "384px",
    maxWidth: "100%",
    boxSizing: "border-box",
    borderRadius: "8px", // Added border radius
  } as React.CSSProperties,

  dataContainer: {
    marginTop: "32px",
    padding: "32px",
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    maxWidth: "1800px", // Expanded for navigation tool
    margin: "32px auto 0",
    boxSizing: "border-box",
    borderRadius: "8px", // Added border radius
  } as React.CSSProperties,

  dataBox: {
    backgroundColor: "#262626",
    padding: "20px",
    border: "1px solid #404040",
    boxSizing: "border-box",
    borderRadius: "6px", // Added border radius
  } as React.CSSProperties,

  // NEW: CSV export preview boxes
  csvPreviewBox: {
    backgroundColor: "#1f2937",
    padding: "16px",
    border: "1px solid #374151",
    borderLeft: "4px solid #10b981",
    boxSizing: "border-box",
    borderRadius: "6px",
  } as React.CSSProperties,

  poiPreviewBox: {
    backgroundColor: "#1f2937",
    padding: "16px",
    border: "1px solid #374151",
    borderLeft: "4px solid #dc2626",
    boxSizing: "border-box",
    borderRadius: "6px",
  } as React.CSSProperties,

  connectionPreviewBox: {
    backgroundColor: "#1f2937",
    padding: "16px",
    border: "1px solid #374151",
    borderLeft: "4px solid #7c3aed",
    boxSizing: "border-box",
    borderRadius: "6px",
  } as React.CSSProperties,

  textarea: {
    width: "100%",
    height: "300px",
    padding: "12px",
    fontSize: "11px",
    fontFamily: "monospace",
    border: "1px solid #555",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    resize: "none" as const,
    boxSizing: "border-box",
    borderRadius: "4px", // Added border radius
  } as React.CSSProperties,

  instructionsBox: {
    backgroundColor: "#262626",
    border: "1px solid #404040",
    padding: "24px",
    boxSizing: "border-box",
    borderRadius: "6px", // Added border radius
  } as React.CSSProperties,

  // NEW: Color palette grid styling
  colorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
    backgroundColor: "#333",
    padding: "12px",
    border: "1px solid #555",
    borderRadius: "6px",
  } as React.CSSProperties,

  colorButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    border: "1px solid #666",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    position: "relative" as const,
    borderRadius: "4px",
  } as React.CSSProperties,

  colorButtonSelected: {
    border: "2px solid #ffffff",
    transform: "scale(1.02)",
  } as React.CSSProperties,

  // NEW: Stats display styling
  statBadge: {
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff",
    borderRadius: "4px",
  } as React.CSSProperties,

  walkwayBadge: {
    backgroundColor: "#16a34a",
  } as React.CSSProperties,

  poiBadge: {
    backgroundColor: "#dc2626",
  } as React.CSSProperties,

  connectionBadge: {
    backgroundColor: "#2563eb",
  } as React.CSSProperties,

  labelBadge: {
    backgroundColor: "#16a34a",
  } as React.CSSProperties,

  // NEW: Category selection styling
  categorySelector: {
    backgroundColor: "#1f2937",
    padding: "12px",
    border: "1px solid #374151",
    borderLeft: "4px solid #dc2626",
    borderRadius: "6px",
  } as React.CSSProperties,

  categoryLabel: {
    color: "#fbbf24",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block",
  } as React.CSSProperties,

  // NEW: Floor indicator styling
  floorIndicator: {
    backgroundColor: "#064e3b",
    border: "1px solid #10b981",
    color: "#10b981",
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "4px",
  } as React.CSSProperties,

  // NEW: Connection line toggle styling
  toggleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0",
  } as React.CSSProperties,

  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  } as React.CSSProperties,

  checkboxLabel: {
    color: "#ccc",
    fontWeight: "500",
    cursor: "pointer",
  } as React.CSSProperties,
};
