import React from "react";
import { Icons } from "./Icons";
import { styles } from "../styles/styles";

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: "csv" | "json" | "png";
  content: string;
  onDownload: () => void;
  filename: string;
}

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  isOpen,
  onClose,
  exportType,
  content,
  onDownload,
  filename,
}) => {
  if (!isOpen) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      alert("Content copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const renderContent = () => {
    if (exportType === "png") {
      return (
        <div style={{ textAlign: "center" }}>
          <img
            src={content}
            alt="Canvas Export"
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              border: "1px solid #666",
              borderRadius: "4px",
            }}
          />
          <p style={{ color: "#ccc", fontSize: "14px", marginTop: "12px" }}>
            Canvas exported as PNG image
          </p>
        </div>
      );
    }

    return (
      <textarea
        value={content}
        readOnly
        style={{
          ...styles.textarea,
          height: "400px",
          fontFamily: "monospace",
          fontSize: "11px",
          lineHeight: "1.4",
          resize: "none",
        }}
      />
    );
  };

  return (
    <div style={styles.modal}>
      <div
        style={{
          ...styles.modalContent,
          width: "80%",
          maxWidth: "800px",
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#ffffff",
              margin: 0,
            }}
          >
            Export Preview - {exportType.toUpperCase()}
          </h3>
          <button
            onClick={onClose}
            style={{
              ...styles.button,
              padding: "6px",
              fontSize: "14px",
            }}
          >
            <Icons.X size={16} />
          </button>
        </div>

        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #374151",
            borderRadius: "4px",
            padding: "12px",
            marginBottom: "16px",
            color: "#fbbf24",
            fontSize: "12px",
          }}
        >
          <strong>📁 {filename}</strong>
          <br />
          {exportType === "csv" && "Navigation data for AI pathfinding systems"}
          {exportType === "json" &&
            "Complete project data with all floors and settings"}
          {exportType === "png" && "Canvas image export for documentation"}
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            marginBottom: "16px",
          }}
        >
          {renderContent()}
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          {exportType !== "png" && (
            <button
              onClick={copyToClipboard}
              style={{
                ...styles.button,
                ...styles.primaryButton,
              }}
            >
              <Icons.FileText size={16} />
              Copy to Clipboard
            </button>
          )}

          <button
            onClick={onDownload}
            style={{
              ...styles.button,
              ...styles.successButton,
            }}
          >
            <Icons.Download size={16} />
            Download {exportType.toUpperCase()}
          </button>

          <button onClick={onClose} style={styles.button}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
