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
    width: "100vw",
    overflow: "auto",
  } as React.CSSProperties,

  container: {
    minHeight: "100vh",
    backgroundColor: "#0f0f0f",
    color: "#ffffff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    margin: 0,
    padding: 0,
  } as React.CSSProperties,

  mainCard: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    minHeight: "100vh",
    boxSizing: "border-box",
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

  input: {
    padding: "8px 12px",
    border: "1px solid #555",
    backgroundColor: "#333",
    color: "#fff",
    fontSize: "14px",
  } as React.CSSProperties,

  range: {
    flex: 1,
    height: "6px",
    backgroundColor: "#404040",
    outline: "none",
    cursor: "pointer",
  } as React.CSSProperties,

  canvasContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "24px",
    padding: "20px",
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    position: "relative" as const,
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
  } as React.CSSProperties,

  modalContent: {
    backgroundColor: "#1a1a1a",
    border: "1px solid #404040",
    padding: "32px",
    width: "384px",
    maxWidth: "100%",
  } as React.CSSProperties,

  dataContainer: {
    marginTop: "32px",
    padding: "32px",
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    maxWidth: "1400px",
    margin: "32px auto 0",
  } as React.CSSProperties,

  dataBox: {
    backgroundColor: "#262626",
    padding: "20px",
    border: "1px solid #404040",
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
    boxSizing: "border-box" as const,
  } as React.CSSProperties,

  instructionsBox: {
    marginTop: "32px",
    backgroundColor: "#262626",
    border: "1px solid #404040",
    padding: "24px",
  } as React.CSSProperties,
};
