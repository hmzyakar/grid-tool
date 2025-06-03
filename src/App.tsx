import React, { useState, useRef, useEffect, useCallback } from "react";
import { Icons } from "./components/Icons";
import { ColorPalette, Color } from "./components/ColorPalette";
import { GridControls } from "./components/GridControls";
import { styles } from "./styles/styles";
import {
  DEFAULT_COLORS,
  DEFAULT_GRID_SIZE,
  DEFAULT_CANVAS_SIZE,
  UI_MESSAGES,
} from "./utils/constants";
import {
  coordsToKey,
  keyToCoords,
  canvasToGridCoords,
  gridToCanvasCoords,
  drawCanvasGrid,
  drawPaintedCells,
  drawCellLabels,
  resizeImageToFit,
} from "./utils/canvasUtils";

interface CellData {
  row: number;
  col: number;
  color: string;
  colorName: string;
  labels: string[];
  isPainted: boolean;
  hasLabel: boolean;
}

const GridPainter: React.FC = () => {
  // Core state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paintedCells, setPaintedCells] = useState<Map<string, string>>(
    new Map()
  );
  const [cellLabels, setCellLabels] = useState<Map<string, string[]>>(
    new Map()
  );
  const [colorPresets, setColorPresets] = useState<Map<string, string[]>>(
    new Map()
  );

  // UI state
  const [paintColor, setPaintColor] = useState(DEFAULT_COLORS[0].value);
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [labelSize, setLabelSize] = useState(8);
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [backgroundVisible, setBackgroundVisible] = useState(true);
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState<string>("untitled");

  // Interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [paintingAction, setPaintingAction] = useState<"paint" | "erase">(
    "paint"
  );
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelModalCell, setLabelModalCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [tempLabel, setTempLabel] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearType, setClearType] = useState<"all" | "painted" | "labels">(
    "all"
  );
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetColor, setPresetColor] = useState("");
  const [presetLabels, setPresetLabels] = useState("");

  const exportSectionRef = useRef<HTMLDivElement>(null);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = DEFAULT_CANVAS_SIZE.width;
    canvas.height = DEFAULT_CANVAS_SIZE.height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }
  }, []);

  // Global body styles to prevent horizontal scrollbar
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflowX = "hidden";
    document.body.style.boxSizing = "border-box";

    return () => {
      // Cleanup on unmount
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflowX = "";
      document.body.style.boxSizing = "";
    };
  }, []);

  // Mouse wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => Math.max(0.1, Math.min(10, prev + delta)));
      }
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  // Pan sınırları hesaplama
  const getPanLimits = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return null;

    const { width: imgWidth, height: imgHeight } =
      resizeImageToFit(backgroundImage);
    const maxOffset = Math.max(imgWidth, imgHeight) * zoom;

    return {
      minX: -maxOffset,
      maxX: maxOffset,
      minY: -maxOffset,
      maxY: maxOffset,
    };
  }, [backgroundImage, zoom]);

  // Center view function
  const centerView = useCallback(() => {
    if (backgroundImage) {
      const { width: imgWidth, height: imgHeight } =
        resizeImageToFit(backgroundImage);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const centerX = (canvas.width - imgWidth * zoom) / 2;
      const centerY = (canvas.height - imgHeight * zoom) / 2;

      setCanvasOffset({ x: centerX, y: centerY });
    } else {
      setCanvasOffset({ x: 0, y: 0 });
    }
    setGridOffset({ x: 0, y: 0 });
    setZoom(1);
  }, [backgroundImage, zoom]);

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Apply zoom and offset
    ctx.scale(zoom, zoom);
    ctx.translate(canvasOffset.x / zoom, canvasOffset.y / zoom);

    // Calculate canvas size in world coordinates
    const worldCanvasSize = {
      width: canvas.width,
      height: canvas.height,
    };

    // Draw background image
    if (backgroundImage && backgroundVisible) {
      const { width, height } = resizeImageToFit(backgroundImage);
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    }

    // Draw grid
    drawCanvasGrid(
      ctx,
      worldCanvasSize,
      gridOffset,
      gridSize,
      isGridVisible,
      zoom,
      canvasOffset
    );

    // Draw painted cells
    drawPaintedCells(
      ctx,
      paintedCells,
      worldCanvasSize,
      gridOffset,
      gridSize,
      zoom,
      canvasOffset,
      cellLabels
    );

    // Draw cell labels
    drawCellLabels(
      ctx,
      cellLabels,
      paintedCells,
      worldCanvasSize,
      gridOffset,
      gridSize,
      labelsVisible,
      zoom,
      labelColor,
      canvasOffset,
      labelSize
    );

    // Restore context
    ctx.restore();
  }, [
    zoom,
    canvasOffset,
    gridOffset,
    gridSize,
    isGridVisible,
    backgroundImage,
    backgroundVisible,
    paintedCells,
    cellLabels,
    labelsVisible,
    labelColor,
    labelSize,
  ]);

  // Draw on changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) return; // Ignore right click here
    if (e.button === 1) return; // Ignore middle click

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    setLastMousePos({ x: canvasX, y: canvasY });

    if (e.ctrlKey || e.metaKey) {
      // Ctrl + left click - start dragging
      setIsDragging(true);
    } else if (e.button === 0) {
      // Left click - start painting
      setIsPainting(true);

      // Determine action based on first click
      const { col, row } = canvasToGridCoords(
        canvasX,
        canvasY,
        canvasOffset,
        zoom,
        gridOffset,
        gridSize
      );
      const cellKey = coordsToKey(row, col);
      const existingColor = paintedCells.get(cellKey);

      if (existingColor === paintColor) {
        setPaintingAction("erase");
      } else {
        setPaintingAction("paint");
      }

      paintCell(canvasX, canvasY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    if (isDragging) {
      const deltaX = canvasX - lastMousePos.x;
      const deltaY = canvasY - lastMousePos.y;

      // Pan sınırlarını uygula
      const limits = getPanLimits();
      let newX = canvasOffset.x + deltaX;
      let newY = canvasOffset.y + deltaY;

      if (limits) {
        newX = Math.max(limits.minX, Math.min(limits.maxX, newX));
        newY = Math.max(limits.minY, Math.min(limits.maxY, newY));
      }

      setCanvasOffset({ x: newX, y: newY });
    } else if (isPainting) {
      paintCell(canvasX, canvasY);
    }

    setLastMousePos({ x: canvasX, y: canvasY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPainting(false);
  };

  const handleRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const { col, row } = canvasToGridCoords(
      canvasX,
      canvasY,
      canvasOffset,
      zoom,
      gridOffset,
      gridSize
    );

    setLabelModalCell({ row, col });
    const cellKey = coordsToKey(row, col);
    const existingLabels = cellLabels.get(cellKey) || [];
    setTempLabel(existingLabels.join(", "));
    setShowLabelModal(true);
  };

  // Paint cell function
  const paintCell = (canvasX: number, canvasY: number) => {
    const { col, row } = canvasToGridCoords(
      canvasX,
      canvasY,
      canvasOffset,
      zoom,
      gridOffset,
      gridSize
    );
    const cellKey = coordsToKey(row, col);

    setPaintedCells((prev) => {
      const newMap = new Map(prev);
      const existingColor = newMap.get(cellKey);

      if (isPainting) {
        // During continuous painting, use the determined action
        if (paintingAction === "erase") {
          newMap.delete(cellKey);
          // Boya kaldırılınca label'ı da kaldır
          setCellLabels((prevLabels) => {
            const newLabelMap = new Map(prevLabels);
            newLabelMap.delete(cellKey);
            return newLabelMap;
          });
        } else {
          newMap.set(cellKey, paintColor);

          // Apply preset labels if this is a new paint (not recolor)
          if (!existingColor) {
            const presetLabelsForColor = colorPresets.get(paintColor);
            if (presetLabelsForColor && presetLabelsForColor.length > 0) {
              setCellLabels((prevLabels) => {
                const newLabelMap = new Map(prevLabels);
                const existingLabels = newLabelMap.get(cellKey) || [];
                const combinedLabels =
                  existingLabels.concat(presetLabelsForColor);
                const newLabels = Array.from(new Set(combinedLabels));
                newLabelMap.set(cellKey, newLabels);
                return newLabelMap;
              });
            }
          }
        }
      } else {
        // Single click behavior
        if (existingColor === paintColor) {
          // Same color clicked - remove the cell and its label
          newMap.delete(cellKey);
          setCellLabels((prevLabels) => {
            const newLabelMap = new Map(prevLabels);
            newLabelMap.delete(cellKey);
            return newLabelMap;
          });
        } else {
          // Different color or unpainted cell - paint it
          newMap.set(cellKey, paintColor);

          // Apply preset labels if available and it's a new paint (not recolor)
          if (!existingColor) {
            const presetLabelsForColor = colorPresets.get(paintColor);
            if (presetLabelsForColor && presetLabelsForColor.length > 0) {
              setCellLabels((prevLabels) => {
                const newLabelMap = new Map(prevLabels);
                const existingLabels = newLabelMap.get(cellKey) || [];
                const combinedLabels =
                  existingLabels.concat(presetLabelsForColor);
                const newLabels = Array.from(new Set(combinedLabels));
                newLabelMap.set(cellKey, newLabels);
                return newLabelMap;
              });
            }
          }
        }
      }

      return newMap;
    });
  };

  // Label modal handlers
  const handleLabelSubmit = () => {
    if (!labelModalCell) return;

    const cellKey = coordsToKey(labelModalCell.row, labelModalCell.col);
    const newLabels = tempLabel
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    setCellLabels((prev) => {
      const newMap = new Map(prev);
      if (newLabels.length === 0) {
        newMap.delete(cellKey);
      } else {
        newMap.set(cellKey, newLabels);
      }
      return newMap;
    });

    setShowLabelModal(false);
    setLabelModalCell(null);
    setTempLabel("");
  };

  // Clear functions
  const handleClearRequest = (type: "all" | "painted" | "labels") => {
    setClearType(type);
    setShowClearConfirm(true);
  };

  const handleClearConfirm = () => {
    if (clearType === "all" || clearType === "painted") {
      setPaintedCells(new Map());
    }
    if (clearType === "all" || clearType === "labels") {
      setCellLabels(new Map());
    }

    setShowClearConfirm(false);
  };

  // Preset management
  const handleCreatePreset = () => {
    const labels = presetLabels
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    setColorPresets((prev) => {
      const newMap = new Map(prev);
      newMap.set(presetColor, labels);
      return newMap;
    });
    setShowPresetModal(false);
    setPresetColor("");
    setPresetLabels("");
  };

  // Image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Extract filename without extension
    const fileName =
      file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    setImageName(fileName);

    const img = new Image();
    img.onload = () => {
      setBackgroundImage(img);
      // Resim yüklendiğinde otomatik olarak ortala
      setTimeout(() => centerView(), 100);
    };
    img.src = URL.createObjectURL(file);
  };

  // JSON import
  const handleJSONImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData: {
          cells: {
            row: number;
            col: number;
            color?: string;
            labels?: string[];
            isPainted: boolean;
            hasLabel: boolean;
          }[];
          colorPresets?: { [key: string]: string[] };
          metadata?: {
            imageName?: string;
            gridSize?: number;
            zoom?: number;
            labelSize?: number;
            labelColor?: string;
            paintColor?: string;
            isGridVisible?: boolean;
            labelsVisible?: boolean;
            backgroundVisible?: boolean;
            gridOffset?: { x: number; y: number };
            canvasOffset?: { x: number; y: number };
          };
        } = JSON.parse(e.target?.result as string);

        // Validate JSON structure
        if (!jsonData.cells || !Array.isArray(jsonData.cells)) {
          alert("Invalid JSON format");
          return;
        }

        // Restore painted cells and labels
        const newPaintedCells = new Map<string, string>();
        const newCellLabels = new Map<string, string[]>();

        jsonData.cells.forEach((cell) => {
          const cellKey = coordsToKey(cell.row, cell.col);

          if (cell.isPainted && cell.color) {
            newPaintedCells.set(cellKey, cell.color);
          }

          if (cell.hasLabel && cell.labels && cell.labels.length > 0) {
            newCellLabels.set(cellKey, cell.labels);
          }
        });

        // Restore color presets
        const newColorPresets = new Map<string, string[]>();
        if (jsonData.colorPresets) {
          for (const color in jsonData.colorPresets) {
            if (jsonData.colorPresets.hasOwnProperty(color)) {
              const labels = jsonData.colorPresets[color] as string[];
              newColorPresets.set(color, labels);
            }
          }
        }

        // Apply all restored data
        setPaintedCells(newPaintedCells);
        setCellLabels(newCellLabels);
        setColorPresets(newColorPresets);

        // Restore ALL metadata settings
        if (jsonData.metadata) {
          if (jsonData.metadata.imageName)
            setImageName(jsonData.metadata.imageName);
          if (jsonData.metadata.gridSize)
            setGridSize(jsonData.metadata.gridSize);
          if (jsonData.metadata.zoom) setZoom(jsonData.metadata.zoom);
          if (jsonData.metadata.labelSize)
            setLabelSize(jsonData.metadata.labelSize);
          if (jsonData.metadata.labelColor)
            setLabelColor(jsonData.metadata.labelColor);
          if (jsonData.metadata.paintColor)
            setPaintColor(jsonData.metadata.paintColor);
          if (typeof jsonData.metadata.isGridVisible === "boolean")
            setIsGridVisible(jsonData.metadata.isGridVisible);
          if (typeof jsonData.metadata.labelsVisible === "boolean")
            setLabelsVisible(jsonData.metadata.labelsVisible);
          if (typeof jsonData.metadata.backgroundVisible === "boolean")
            setBackgroundVisible(jsonData.metadata.backgroundVisible);
          if (jsonData.metadata.gridOffset)
            setGridOffset(jsonData.metadata.gridOffset);
          if (jsonData.metadata.canvasOffset)
            setCanvasOffset(jsonData.metadata.canvasOffset);
        }

        alert(
          `Successfully imported ${newPaintedCells.size} painted cells and ${newCellLabels.size} labeled cells!\nAll settings restored perfectly!`
        );
      } catch (error) {
        alert("Error parsing JSON file");
        console.error("JSON import error:", error);
      }
    };

    reader.readAsText(file);
    // Reset file input
    event.target.value = "";
  };

  // Generate smart filename
  const generateFileName = (extension: string) => {
    // Build filename parts
    const parts = [
      "gridpainter",
      imageName,
      `image-${backgroundVisible ? "on" : "off"}`,
      `grid${gridSize}-${isGridVisible ? "on" : "off"}`,
      `labels${labelSize}-${labelsVisible ? "on" : "off"}`,
      `zoom${Math.round(zoom * 100)}`,
      `p${paintedCells.size}l${cellLabels.size}`,
    ];

    return parts.join("_") + extension;
  };

  // Export functions
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const filename = generateFileName(".png");
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();

    setTimeout(() => {
      exportSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleExportJSON = () => {
    const exportData = generateExportData();
    const filename = generateFileName(".json");
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();

    setTimeout(() => {
      exportSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Generate export data
  const generateExportData = () => {
    const data: CellData[] = [];
    const allCells = new Set<string>();

    // Add all painted cell keys
    paintedCells.forEach((_, key) => allCells.add(key));
    // Add all labeled cell keys
    cellLabels.forEach((_, key) => allCells.add(key));

    allCells.forEach((cellKey) => {
      const { row, col } = keyToCoords(cellKey);
      const color = paintedCells.get(cellKey);
      const labels = cellLabels.get(cellKey) || [];
      const colorObj = DEFAULT_COLORS.find((c) => c.value === color);

      data.push({
        row,
        col,
        color: color || "",
        colorName: colorObj?.name || "",
        labels,
        isPainted: !!color,
        hasLabel: labels.length > 0,
      });
    });

    // Convert colorPresets Map to object manually
    const colorPresetsObj: { [key: string]: string[] } = {};
    colorPresets.forEach((value, key) => {
      colorPresetsObj[key] = value;
    });

    return {
      metadata: {
        exportDate: new Date().toISOString(),
        imageName,
        gridSize,
        zoom,
        labelSize,
        labelColor,
        paintColor,
        isGridVisible,
        labelsVisible,
        backgroundVisible,
        gridOffset,
        canvasOffset,
        totalCells: data.length,
        paintedCells: paintedCells.size,
        labeledCells: cellLabels.size,
      },
      colorPresets: colorPresetsObj,
      cells: data.sort((a, b) => a.row - b.row || a.col - b.col),
    };
  };

  return (
    <div style={styles.globalContainer}>
      <div style={styles.container}>
        <div style={styles.mainCard}>
          <h1 style={styles.title}>
            <Icons.Palette
              size={32}
              style={{ verticalAlign: "middle", marginRight: "12px" }}
            />
            Grid Painter Pro
          </h1>

          {/* Upload Section */}
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
              <Icons.Upload size={18} />
              Upload Image
            </h3>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                <Icons.Upload size={16} />
                Upload Image
              </label>

              <input
                type="file"
                accept=".json"
                onChange={handleJSONImport}
                style={{ display: "none" }}
                id="jsonImport"
              />
              <label
                htmlFor="jsonImport"
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                <Icons.FileText size={16} />
                Import JSON
              </label>
            </div>
          </div>

          {/* Color Palette - Actions'ın altında */}
          <ColorPalette
            colors={DEFAULT_COLORS}
            paintColor={paintColor}
            setPaintColor={setPaintColor}
            labelColor={labelColor}
            setLabelColor={setLabelColor}
            onCreatePreset={() => {
              setPresetColor(paintColor);
              setShowPresetModal(true);
            }}
            colorPresets={colorPresets}
          />

          {/* Grid Controls - Canvas'ın hemen üstünde */}
          <GridControls
            gridSize={gridSize}
            setGridSize={setGridSize}
            isGridVisible={isGridVisible}
            setIsGridVisible={setIsGridVisible}
            labelsVisible={labelsVisible}
            setLabelsVisible={setLabelsVisible}
            backgroundVisible={backgroundVisible}
            setBackgroundVisible={setBackgroundVisible}
            gridOffset={gridOffset}
            setGridOffset={setGridOffset}
            paintedCells={paintedCells}
            cellLabels={cellLabels}
            zoom={zoom}
            setZoom={setZoom}
            centerView={centerView}
            labelSize={labelSize}
            setLabelSize={setLabelSize}
          />

          {/* Action Buttons - Near Canvas */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              marginBottom: "16px",
              padding: "16px",
              backgroundColor: "#262626",
              border: "1px solid #404040",
              flexWrap: "wrap",
            }}
          >
            {/* Export Buttons */}
            <button
              onClick={handleExportPNG}
              style={{ ...styles.button, ...styles.successButton }}
            >
              <Icons.Download size={16} />
              Export PNG
            </button>

            <button
              onClick={handleExportJSON}
              style={{ ...styles.button, ...styles.successButton }}
            >
              <Icons.FileText size={16} />
              Export JSON
            </button>

            {/* Separator */}
            <div
              style={{
                width: "1px",
                backgroundColor: "#555",
                margin: "0 8px",
                alignSelf: "stretch",
              }}
            />

            {/* Clear Buttons */}
            <button
              onClick={() => handleClearRequest("painted")}
              style={{ ...styles.button, ...styles.warningButton }}
            >
              <Icons.RotateCcw size={16} />
              Clear Painted
            </button>

            <button
              onClick={() => handleClearRequest("labels")}
              style={{ ...styles.button, ...styles.warningButton }}
            >
              <Icons.Type size={16} />
              Clear Labels
            </button>

            <button
              onClick={() => handleClearRequest("all")}
              style={{ ...styles.button, ...styles.dangerButton }}
            >
              <Icons.X size={16} />
              Clear All
            </button>
          </div>

          {/* Canvas */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "24px",
              padding: "20px",
              backgroundColor: "#1a1a1a",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                border: "3px solid #404040",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={handleRightClick}
                style={{
                  cursor: isDragging
                    ? "grabbing"
                    : isPainting
                    ? "crosshair"
                    : "default",
                  backgroundColor: "#000000",
                  display: "block",
                }}
              />
            </div>
          </div>

          {/* Instructions */}
          <div style={styles.instructionsBox}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "12px",
              }}
            >
              How to Use:
            </h3>
            <ul
              style={{
                color: "#ccc",
                lineHeight: "1.6",
                margin: 0,
                paddingLeft: "20px",
              }}
            >
              <li>
                <strong>Left Click:</strong> Paint cells (hold and drag for
                multiple cells)
              </li>
              <li>
                <strong>Left Click (Same Color):</strong> Remove painted cell
              </li>
              <li>
                <strong>Right Click:</strong> Add/edit labels
              </li>
              <li>
                <strong>Ctrl + Left Click + Drag:</strong> Pan canvas (with
                limits)
              </li>
              <li>
                <strong>Ctrl + Mouse Wheel:</strong> Zoom in/out (up to 1000%)
              </li>
              <li>
                <strong>Center View Button:</strong> Reset view to image center
              </li>
              <li>
                <strong>Color Presets:</strong> Create preset labels for colors
              </li>
              <li>
                <strong>Multiple Labels:</strong> Separate labels with commas
              </li>
            </ul>
          </div>

          {/* Export Section */}
          <div ref={exportSectionRef} style={styles.dataContainer}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "20px",
              }}
            >
              Export Data
            </h2>

            {paintedCells.size === 0 && cellLabels.size === 0 ? (
              <div style={styles.dataBox}>
                <p
                  style={{
                    color: "#888",
                    textAlign: "center",
                    margin: "40px 0",
                  }}
                >
                  {UI_MESSAGES.noData}
                </p>
              </div>
            ) : (
              <div style={styles.dataBox}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#ffffff",
                    marginBottom: "12px",
                  }}
                >
                  Grid Data (JSON)
                </h3>
                <textarea
                  value={JSON.stringify(generateExportData(), null, 2)}
                  readOnly
                  style={styles.textarea}
                  onClick={(e) => e.currentTarget.select()}
                />
                <p
                  style={{ color: "#888", fontSize: "12px", marginTop: "8px" }}
                >
                  {UI_MESSAGES.copyInstructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Label Modal */}
      {showLabelModal && (
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
              Edit Labels
            </h3>
            <p
              style={{ color: "#ccc", marginBottom: "12px", fontSize: "14px" }}
            >
              Cell: ({labelModalCell?.row}, {labelModalCell?.col})
            </p>
            <p
              style={{ color: "#ccc", marginBottom: "16px", fontSize: "14px" }}
            >
              Separate multiple labels with commas
            </p>
            <input
              type="text"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              placeholder="Enter labels (comma separated)"
              style={{ ...styles.input, width: "100%", marginBottom: "16px" }}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleLabelSubmit()}
            />
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowLabelModal(false)}
                style={styles.button}
              >
                Cancel
              </button>
              <button
                onClick={handleLabelSubmit}
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
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
              Confirm Clear
            </h3>
            <p style={{ color: "#ccc", marginBottom: "20px" }}>
              Are you sure you want to clear{" "}
              {clearType === "all"
                ? "all data"
                : clearType === "painted"
                ? "painted cells"
                : "labels"}
              ? This action cannot be undone.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowClearConfirm(false)}
                style={styles.button}
              >
                Cancel
              </button>
              <button
                onClick={handleClearConfirm}
                style={{ ...styles.button, ...styles.dangerButton }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Modal */}
      {showPresetModal && (
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
              Create Color Preset
            </h3>
            <p
              style={{ color: "#ccc", marginBottom: "16px", fontSize: "14px" }}
            >
              Create default labels for color:{" "}
              {DEFAULT_COLORS.find((c) => c.value === presetColor)?.name ||
                presetColor}
            </p>
            <input
              type="text"
              value={presetLabels}
              onChange={(e) => setPresetLabels(e.target.value)}
              placeholder="Enter default labels (comma separated)"
              style={{ ...styles.input, width: "100%", marginBottom: "16px" }}
              autoFocus
            />
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowPresetModal(false)}
                style={styles.button}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePreset}
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridPainter;
