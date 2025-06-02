import React, { useState, useRef, useEffect, useCallback } from "react";

// Components
import { Icons } from "./components/Icons";
import { ColorPalette, Color } from "./components/ColorPalette";
import { GridControls } from "./components/GridControls";
import { ZoomControls } from "./components/ZoomControls";

// Utils
import {
  coordsToKey,
  keyToCoords,
  canvasToGridCoords,
  gridToCanvasCoords,
  getContrastColor,
  resizeImageToFit,
  drawCanvasGrid,
  drawPaintedCells,
  drawCellLabels,
} from "./utils/canvasUtils";

// Constants
import {
  DEFAULT_COLORS,
  DEFAULT_GRID_SIZE,
  DEFAULT_ZOOM,
  DEFAULT_CANVAS_SIZE,
  LONG_PRESS_DURATION,
  MAX_LABEL_LENGTH,
  EXPORT_DATE_FORMAT,
  CANVAS_SETTINGS,
  UI_MESSAGES,
} from "./utils/constants";

// Styles
import { styles } from "./styles/styles";

interface JsonExportData {
  info: {
    totalCells: number;
    paintedCells: number;
    labeledCells: number;
    gridSize: number;
    gridOffset: { x: number; y: number };
    exportDate: string;
    exportTime: string;
  };
  coordinates: Array<{
    row: number;
    col: number;
    coordinate: string;
    color: string | null;
    colorName: string | null;
    label: string | null;
    isPainted: boolean;
    hasLabel: boolean;
  }>;
}

const GridPainter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Core state
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [gridSize, setGridSize] = useState<number>(DEFAULT_GRID_SIZE);
  const [paintColor, setPaintColor] = useState<string>(DEFAULT_COLORS[0].value);
  const [paintedCells, setPaintedCells] = useState<Map<string, string>>(
    new Map()
  );
  const [cellLabels, setCellLabels] = useState<Map<string, string>>(new Map());
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>(DEFAULT_CANVAS_SIZE);
  const [isGridVisible, setIsGridVisible] = useState<boolean>(true);
  const [gridOffset, setGridOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [labelsVisible, setLabelsVisible] = useState<boolean>(true);

  // Modal states
  const [showLabelModal, setShowLabelModal] = useState<boolean>(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState<string>("");

  // Display states
  const [showJsonData, setShowJsonData] = useState<boolean>(false);
  const [showPngData, setShowPngData] = useState<boolean>(false);
  const [pngDataUrl, setPngDataUrl] = useState<string>("");
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);

  // Mouse handling states
  const [mouseDownTimer, setMouseDownTimer] = useState<number | null>(null);
  const [isLongPress, setIsLongPress] = useState<boolean>(false);
  const [mouseDownCell, setMouseDownCell] = useState<string | null>(null);

  // Drag states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Helper function to generate JSON data
  const getCurrentJsonData = (): string => {
    const allCells = new Set([
      ...Array.from(paintedCells.keys()),
      ...Array.from(cellLabels.keys()),
    ]);

    if (allCells.size === 0) {
      return JSON.stringify({ message: UI_MESSAGES.noData }, null, 2);
    }

    const sortedCells = Array.from(allCells).sort((a, b) => {
      const { row: rowA, col: colA } = keyToCoords(a);
      const { row: rowB, col: colB } = keyToCoords(b);
      if (rowA !== rowB) return rowA - rowB;
      return colA - colB;
    });

    const colorData: JsonExportData = {
      info: {
        totalCells: allCells.size,
        paintedCells: paintedCells.size,
        labeledCells: cellLabels.size,
        gridSize: gridSize,
        gridOffset: gridOffset,
        exportDate: EXPORT_DATE_FORMAT.date(),
        exportTime: EXPORT_DATE_FORMAT.time(),
      },
      coordinates: sortedCells.map((cellKey) => {
        const { row, col } = keyToCoords(cellKey);
        const color = paintedCells.get(cellKey);
        const label = cellLabels.get(cellKey);
        const colorName = color
          ? DEFAULT_COLORS.find((c) => c.value === color)?.name || color
          : null;

        return {
          row,
          col,
          coordinate: `(${row}, ${col})`,
          color: color ? color.toUpperCase() : null,
          colorName,
          label: label || null,
          isPainted: !!color,
          hasLabel: !!label,
        };
      }),
    };

    return JSON.stringify(colorData, null, 2);
  };

  // Canvas drawing function
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size with zoom
    const displayWidth = canvasSize.width * zoom;
    const displayHeight = canvasSize.height * zoom;
    const pixelRatio = CANVAS_SETTINGS.pixelRatio();

    canvas.width = displayWidth * pixelRatio;
    canvas.height = displayHeight * pixelRatio;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Apply transformations
    ctx.save();
    ctx.translate(canvasOffset.x, canvasOffset.y);
    ctx.scale(zoom, zoom);

    // Draw image
    if (image) {
      ctx.imageSmoothingEnabled = CANVAS_SETTINGS.imageSmoothingEnabled;
      ctx.imageSmoothingQuality = CANVAS_SETTINGS.imageSmoothingQuality;
      ctx.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);
    }

    // Draw painted cells
    drawPaintedCells(ctx, paintedCells, canvasSize, gridOffset, gridSize);

    // Draw labels
    drawCellLabels(
      ctx,
      cellLabels,
      paintedCells,
      canvasSize,
      gridOffset,
      gridSize,
      labelsVisible
    );

    // Draw grid
    drawCanvasGrid(ctx, canvasSize, gridOffset, gridSize, isGridVisible);

    ctx.restore();
  }, [
    image,
    canvasSize,
    gridSize,
    paintedCells,
    cellLabels,
    isGridVisible,
    labelsVisible,
    gridOffset,
    zoom,
    canvasOffset,
  ]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // No longer needed - using middle click instead of right click

  // Event handlers
  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          const newSize = resizeImageToFit(img);
          setCanvasSize(newSize);
          setPaintedCells(new Map());
          setCellLabels(new Map());
          setGridOffset({ x: 0, y: 0 });
          setCanvasOffset({ x: 0, y: 0 });
          setZoom(DEFAULT_ZOOM);
        };
        img.crossOrigin = "anonymous";
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    if (!image) return;
    event.preventDefault();
    event.stopPropagation();

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (event.button === 1) {
      // Middle click - start drag
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
      return;
    }

    if (event.button === 0) {
      // Left click - paint/label
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const { col, row } = canvasToGridCoords(
        x,
        y,
        canvasOffset,
        zoom,
        gridOffset,
        gridSize
      );
      const cellKey = coordsToKey(row, col);

      setMouseDownCell(cellKey);
      setIsLongPress(false);

      const timer = window.setTimeout(() => {
        setIsLongPress(true);
        setEditingCell(cellKey);
        setLabelInput(cellLabels.get(cellKey) || "");
        setShowLabelModal(true);
      }, LONG_PRESS_DURATION);

      setMouseDownTimer(timer);
    }
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    if (isDragging && dragStart) {
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;

      setCanvasOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }

    if (!image || event.button !== 0) return;
    event.preventDefault();

    if (mouseDownTimer) {
      window.clearTimeout(mouseDownTimer);
      setMouseDownTimer(null);
    }

    if (!isLongPress && mouseDownCell) {
      setPaintedCells((prev) => {
        const newMap = new Map(prev);
        if (
          newMap.has(mouseDownCell) &&
          newMap.get(mouseDownCell) === paintColor
        ) {
          newMap.delete(mouseDownCell);
        } else {
          newMap.set(mouseDownCell, paintColor);
        }
        return newMap;
      });
    }

    setMouseDownCell(null);
    setIsLongPress(false);
  };

  const handleMouseLeave = (): void => {
    if (mouseDownTimer) {
      window.clearTimeout(mouseDownTimer);
      setMouseDownTimer(null);
    }
    setMouseDownCell(null);
    setIsLongPress(false);
    setIsDragging(false);
    setDragStart(null);
  };

  const handleContextMenu = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  // Action functions
  const saveLabelEdit = (): void => {
    if (editingCell) {
      setCellLabels((prev) => {
        const newMap = new Map(prev);
        if (labelInput.trim() === "") {
          newMap.delete(editingCell);
        } else {
          newMap.set(editingCell, labelInput.trim());
        }
        return newMap;
      });
    }
    setShowLabelModal(false);
    setEditingCell(null);
    setLabelInput("");
  };

  const cancelLabelEdit = (): void => {
    setShowLabelModal(false);
    setEditingCell(null);
    setLabelInput("");
  };

  const clearPaintedCells = (): void => setPaintedCells(new Map());
  const clearLabels = (): void => setCellLabels(new Map());
  const clearAll = (): void => {
    setPaintedCells(new Map());
    setCellLabels(new Map());
  };

  const resetGrid = (): void => {
    setGridOffset({ x: 0, y: 0 });
    setCanvasOffset({ x: 0, y: 0 });
    setPaintedCells(new Map());
    setCellLabels(new Map());
    setZoom(DEFAULT_ZOOM);
  };

  const resetZoom = (): void => {
    setZoom(DEFAULT_ZOOM);
    setCanvasOffset({ x: 0, y: 0 });
  };

  const downloadImage = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL("image/png");
    setPngDataUrl(dataURL);
    setShowPngData(true);
  };

  return (
    <div style={styles.globalContainer}>
      <div style={styles.mainCard}>
        {/* Header */}
        <div style={styles.title}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: "8px",
            }}
          >
            Grid Painter Pro
          </h1>
          <p style={{ color: "#888", fontSize: "16px" }}>
            Professional grid painting and labeling tool
          </p>
        </div>

        {/* Main Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <label style={{ ...styles.button, ...styles.primaryButton }}>
            <Icons.Upload size={20} />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>

          {image && (
            <>
              <button
                onClick={downloadImage}
                style={{ ...styles.button, ...styles.successButton }}
              >
                <Icons.Download size={20} />
                <span>Download PNG</span>
              </button>

              <button
                onClick={() => setShowJsonData(!showJsonData)}
                style={{
                  ...styles.button,
                  backgroundColor: showJsonData ? "#dc2626" : "#7c3aed",
                }}
              >
                <Icons.FileText size={20} />
                <span>{showJsonData ? "Hide JSON" : "Show JSON"}</span>
              </button>
            </>
          )}
        </div>

        {/* Grid Controls */}
        {image && (
          <GridControls
            gridSize={gridSize}
            setGridSize={setGridSize}
            isGridVisible={isGridVisible}
            setIsGridVisible={setIsGridVisible}
            labelsVisible={labelsVisible}
            setLabelsVisible={setLabelsVisible}
            gridOffset={gridOffset}
            setGridOffset={setGridOffset}
            paintedCells={paintedCells}
            cellLabels={cellLabels}
          />
        )}

        {/* Zoom Controls */}
        {image && (
          <ZoomControls zoom={zoom} setZoom={setZoom} resetZoom={resetZoom} />
        )}

        {/* Canvas Container */}
        <div style={styles.canvasContainer}>
          {image ? (
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{
                cursor: isDragging ? "grabbing" : "crosshair",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                border: "2px dashed #555",
                padding: "60px",
                textAlign: "center",
                color: "#888",
                backgroundColor: "#262626",
              }}
            >
              <Icons.Upload
                size={48}
                style={{ margin: "0 auto 16px", color: "#666" }}
              />
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#ccc",
                }}
              >
                {UI_MESSAGES.uploadPrompt}
              </h3>
              <p style={{ color: "#888" }}>{UI_MESSAGES.supportedFormats}</p>
            </div>
          )}
        </div>

        {/* Color Palette */}
        {image && (
          <ColorPalette
            colors={DEFAULT_COLORS}
            paintColor={paintColor}
            setPaintColor={setPaintColor}
          />
        )}

        {/* Action Buttons */}
        {image && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <button
              onClick={clearPaintedCells}
              style={{ ...styles.button, ...styles.dangerButton }}
            >
              <Icons.RotateCcw size={16} />
              <span>Clear Paint</span>
            </button>
            <button
              onClick={clearLabels}
              style={{ ...styles.button, ...styles.warningButton }}
            >
              <Icons.Type size={16} />
              <span>Clear Labels</span>
            </button>
            <button
              onClick={clearAll}
              style={{ ...styles.button, backgroundColor: "#64748b" }}
            >
              <Icons.X size={16} />
              <span>Clear All</span>
            </button>
            <button
              onClick={resetGrid}
              style={{ ...styles.button, backgroundColor: "#6366f1" }}
            >
              <Icons.RotateCcw size={16} />
              <span>Reset Grid</span>
            </button>
          </div>
        )}

        {/* Usage Instructions */}
        {image && (
          <div style={styles.instructionsBox}>
            <h3
              style={{
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "16px",
                fontSize: "16px",
              }}
            >
              Usage Guide
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                color: "#ccc",
                fontSize: "14px",
              }}
            >
              <div>
                <p style={{ marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#fff" }}>
                    Left click:
                  </span>{" "}
                  Paint/unpaint cells
                </p>
                <p style={{ marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#fff" }}>
                    Long press:
                  </span>{" "}
                  Hold 0.3s to add label
                </p>
                <p style={{ marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#fff" }}>
                    Middle click + drag:
                  </span>{" "}
                  Move image when zoomed
                </p>
              </div>
              <div>
                <p style={{ marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#fff" }}>
                    Zoom:
                  </span>{" "}
                  20% - 500% scaling
                </p>
                <p style={{ marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#fff" }}>
                    JSON data:
                  </span>{" "}
                  Click "Show JSON" → Ctrl+A → Ctrl+C
                </p>
                <p style={{ marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#fff" }}>
                    PNG download:
                  </span>{" "}
                  Right click → "Save image as"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* JSON Data Display */}
      {image && showJsonData && (
        <div style={styles.dataContainer}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              JSON Data
              <div
                style={{
                  fontSize: "12px",
                  color: "#888",
                  backgroundColor: "#333",
                  padding: "4px 8px",
                }}
              >
                Painted: {paintedCells.size} • Labeled: {cellLabels.size}
              </div>
            </h3>
          </div>

          <div style={styles.dataBox}>
            <p
              style={{
                fontSize: "12px",
                color: "#888",
                marginBottom: "12px",
                backgroundColor: "#333",
                padding: "8px",
              }}
            >
              {UI_MESSAGES.copyInstructions}
            </p>
            <textarea
              value={getCurrentJsonData()}
              readOnly
              style={styles.textarea}
              onClick={(e: React.MouseEvent<HTMLTextAreaElement>) => {
                const target = e.target as HTMLTextAreaElement;
                target.focus();
                target.select();
              }}
            />
          </div>
        </div>
      )}

      {/* PNG Image Display */}
      {image && showPngData && pngDataUrl && (
        <div style={styles.dataContainer}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              PNG Image Download
            </h3>
            <button
              onClick={() => setShowPngData(false)}
              style={{ ...styles.button, ...styles.dangerButton }}
            >
              ✕ Close
            </button>
          </div>

          <div style={styles.dataBox}>
            <p
              style={{
                fontSize: "12px",
                color: "#888",
                marginBottom: "12px",
                backgroundColor: "#333",
                padding: "8px",
              }}
            >
              {UI_MESSAGES.downloadInstructions}
            </p>
            <div style={{ textAlign: "center" }}>
              <img
                src={pngDataUrl}
                alt="Grid Painted"
                style={{
                  maxWidth: "100%",
                  maxHeight: "400px",
                  border: "1px solid #555",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Label Edit Modal */}
      {showLabelModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#ffffff",
              }}
            >
              Edit Label
              {editingCell && (
                <span
                  style={{ fontSize: "12px", color: "#888", marginLeft: "8px" }}
                >
                  ({keyToCoords(editingCell).row},{" "}
                  {keyToCoords(editingCell).col})
                </span>
              )}
            </h3>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder={UI_MESSAGES.labelPlaceholder}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #555",
                backgroundColor: "#333",
                color: "#fff",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              maxLength={MAX_LABEL_LENGTH}
              autoFocus
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") saveLabelEdit();
                if (e.key === "Escape") cancelLabelEdit();
              }}
            />
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                onClick={saveLabelEdit}
                style={{ ...styles.button, ...styles.successButton, flex: 1 }}
              >
                Save
              </button>
              <button
                onClick={cancelLabelEdit}
                style={{
                  ...styles.button,
                  backgroundColor: "#64748b",
                  flex: 1,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridPainter;
