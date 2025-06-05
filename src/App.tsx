import React, { useState, useRef, useEffect, useCallback } from "react";
import { Icons } from "./components/Icons";
import { ColorPalette, Color } from "./components/ColorPalette";
import { FloorManagement } from "./components/FloorManagement";
import { GridSettings } from "./components/GridSettings";
import { ViewControls } from "./components/ViewControls";
import { ExportPreviewModal } from "./components/ExportPreviewModal";
import { styles } from "./styles/styles";
import {
  NAVIGATION_COLORS,
  DEFAULT_GRID_SIZE,
  DEFAULT_CANVAS_SIZE,
  UI_MESSAGES,
  FloorData,
  POI_CATEGORIES,
} from "./utils/constants";
import {
  coordsToKey,
  keyToCoords,
  canvasToGridCoords,
  gridToCanvasCoords,
  drawCanvasGrid,
  drawPaintedCells,
  drawCellLabels,
  drawConnectionLines,
  resizeImageToFit,
  generateNavigationGridCSV,
  generatePOICSV,
  generateVerticalConnectionsCSV,
  downloadCSV,
  exportCanvasToPNG,
  downloadPNG,
} from "./utils/canvasUtils";

interface CellData {
  row: number;
  col: number;
  color: string;
  colorName: string;
  labels: string[];
  isPainted: boolean;
  hasLabel: boolean;
  category?: string;
}

const GridPainter: React.FC = () => {
  // Core state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportSectionRef = useRef<HTMLDivElement>(null);

  // Floor management - starts empty
  const [currentFloor, setCurrentFloor] = useState<{
    name: string;
    number: number;
  } | null>(null);
  const [floors, setFloors] = useState<Map<string, FloorData>>(new Map());
  const [floorCounter, setFloorCounter] = useState(0);

  // POI categories per floor
  const [poiCategories, setPOICategories] = useState<
    Map<string, Map<string, string>>
  >(new Map());

  // Current floor data (derived from floors map)
  const currentFloorKey = currentFloor
    ? `${currentFloor.number}_${currentFloor.name}`
    : "";
  const currentFloorData = currentFloor
    ? floors.get(currentFloorKey) || {
        name: currentFloor.name,
        number: currentFloor.number,
        paintedCells: new Map(),
        cellLabels: new Map(),
        colorPresets: new Map(),
        poiCategories: new Map(),
      }
    : null;

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
  const [paintColor, setPaintColor] = useState(NAVIGATION_COLORS[0].value);
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [labelSize, setLabelSize] = useState(8);
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [backgroundVisible, setBackgroundVisible] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [showPrimaryConnections, setShowPrimaryConnections] = useState(true);
  const [showSecondaryConnections, setShowSecondaryConnections] =
    useState(true);
  const [showCornerIndicators, setShowCornerIndicators] = useState(true);
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [floorImages, setFloorImages] = useState<
    Map<string, { image: HTMLImageElement; name: string }>
  >(new Map());
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
  const [tempPOICategory, setTempPOICategory] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearType, setClearType] = useState<"all" | "painted" | "labels">(
    "all"
  );
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetColor, setPresetColor] = useState("");
  const [presetLabels, setPresetLabels] = useState("");

  // Image upload state
  const [showRemoveImageConfirm, setShowRemoveImageConfirm] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportPreviewData, setExportPreviewData] = useState({
    type: "csv" as "csv" | "json" | "png",
    content: "",
    filename: "",
  });

  // Current floor's background image
  const backgroundImage = currentFloor
    ? floorImages.get(currentFloorKey)?.image || null
    : null;

  // Current floor's image name
  const currentImageName = currentFloor
    ? floorImages.get(currentFloorKey)?.name || "untitled"
    : "untitled";

  // Floor Management Functions
  const createFloor = useCallback(
    (name: string, number: number) => {
      const newFloorKey = `${number}_${name}`;

      if (floors.has(newFloorKey)) {
        alert("A floor with this number and name already exists!");
        return;
      }

      const newFloorData: FloorData = {
        name,
        number,
        paintedCells: new Map(),
        cellLabels: new Map(),
        colorPresets: new Map(),
        poiCategories: new Map(),
      };

      setFloors((prev) => new Map(prev).set(newFloorKey, newFloorData));
      setPOICategories((prev) => new Map(prev).set(newFloorKey, new Map()));
      setFloorCounter((prev) => Math.max(prev, number + 1));

      // Switch to new floor if this is first floor
      if (floors.size === 0) {
        setCurrentFloor({ name, number });
        setPaintedCells(new Map());
        setCellLabels(new Map());
        setColorPresets(new Map());
      }
    },
    [floors]
  );

  const switchFloor = useCallback(
    (floorKey: string) => {
      // Save current floor data
      if (currentFloor) {
        const currentKey = `${currentFloor.number}_${currentFloor.name}`;
        setFloors((prev) => {
          const newFloors = new Map(prev);
          const existing = newFloors.get(currentKey) || {
            name: currentFloor.name,
            number: currentFloor.number,
            paintedCells: new Map(),
            cellLabels: new Map(),
            colorPresets: new Map(),
            poiCategories: new Map(),
          };
          newFloors.set(currentKey, {
            ...existing,
            paintedCells: new Map(paintedCells),
            cellLabels: new Map(cellLabels),
            colorPresets: new Map(colorPresets),
          });
          return newFloors;
        });
      }

      // Switch to new floor
      const targetFloor = floors.get(floorKey);
      if (targetFloor) {
        setCurrentFloor({ name: targetFloor.name, number: targetFloor.number });
        setPaintedCells(new Map(targetFloor.paintedCells));
        setCellLabels(new Map(targetFloor.cellLabels));
        setColorPresets(new Map(targetFloor.colorPresets));
      }
    },
    [currentFloor, paintedCells, cellLabels, colorPresets, floors]
  );

  const deleteFloor = useCallback(
    (floorKey: string) => {
      const newFloors = new Map(floors);
      newFloors.delete(floorKey);
      setFloors(newFloors);

      const newPOICategories = new Map(poiCategories);
      newPOICategories.delete(floorKey);
      setPOICategories(newPOICategories);

      // If we deleted the current floor or this was the last floor
      if (newFloors.size === 0) {
        // No floors left - allow this!
        setCurrentFloor(null);
        setPaintedCells(new Map());
        setCellLabels(new Map());
        setColorPresets(new Map());
      } else {
        // Switch to first available floor
        const firstFloor = Array.from(newFloors.entries())[0];
        if (firstFloor) {
          const [key, floorData] = firstFloor;
          setCurrentFloor({ name: floorData.name, number: floorData.number });
          setPaintedCells(new Map(floorData.paintedCells));
          setCellLabels(new Map(floorData.cellLabels));
          setColorPresets(new Map(floorData.colorPresets));
        }
      }
    },
    [floors, poiCategories]
  );

  const editFloor = useCallback(
    (oldKey: string, newName: string, newNumber: number) => {
      const newKey = `${newNumber}_${newName}`;

      // Check if new key already exists (and it's different from old key)
      if (newKey !== oldKey && floors.has(newKey)) {
        alert("A floor with this number and name already exists!");
        return;
      }

      // Get the old floor data
      const oldFloorData = floors.get(oldKey);
      if (!oldFloorData) return;

      // Create updated floor data
      const updatedFloorData: FloorData = {
        ...oldFloorData,
        name: newName,
        number: newNumber,
      };

      // Update floors map
      const newFloors = new Map(floors);
      newFloors.delete(oldKey); // Remove old entry
      newFloors.set(newKey, updatedFloorData); // Add updated entry
      setFloors(newFloors);

      // Update POI categories map
      const oldPOICategories = poiCategories.get(oldKey);
      if (oldPOICategories) {
        const newPOICategories = new Map(poiCategories);
        newPOICategories.delete(oldKey);
        newPOICategories.set(newKey, oldPOICategories);
        setPOICategories(newPOICategories);
      }

      // Update floor images map
      const oldFloorImage = floorImages.get(oldKey);
      if (oldFloorImage) {
        const newFloorImages = new Map(floorImages);
        newFloorImages.delete(oldKey);
        newFloorImages.set(newKey, oldFloorImage);
        setFloorImages(newFloorImages);
      }

      // Update current floor if it was the one being edited
      if (
        currentFloor &&
        `${currentFloor.number}_${currentFloor.name}` === oldKey
      ) {
        setCurrentFloor({ name: newName, number: newNumber });
      }
    },
    [floors, poiCategories, floorImages, currentFloor]
  );

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

  // Global body styles
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflowX = "hidden";
    document.body.style.boxSizing = "border-box";

    return () => {
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

  // Pan limits
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(canvasOffset.x / zoom, canvasOffset.y / zoom);

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

    // Draw connection lines
    drawConnectionLines(
      ctx,
      paintedCells,
      worldCanvasSize,
      gridOffset,
      gridSize,
      showConnections,
      zoom,
      canvasOffset,
      showPrimaryConnections,
      showSecondaryConnections,
      showCornerIndicators
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
    showConnections,
    showPrimaryConnections,
    showSecondaryConnections,
    showCornerIndicators,
  ]);

  // Draw on changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentFloor) return; // No action if no floor

    if (e.button === 2) return;
    if (e.button === 1) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    setLastMousePos({ x: canvasX, y: canvasY });

    if (e.ctrlKey || e.metaKey) {
      setIsDragging(true);
    } else if (e.button === 0) {
      setIsPainting(true);

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

      const limits = getPanLimits();
      let newX = canvasOffset.x + deltaX;
      let newY = canvasOffset.y + deltaY;

      if (limits) {
        newX = Math.max(limits.minX, Math.min(limits.maxX, newX));
        newY = Math.max(limits.minY, Math.min(limits.maxY, newY));
      }

      setCanvasOffset({ x: newX, y: newY });
    } else if (isPainting && currentFloor) {
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

    if (!currentFloor) return;

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

    // Set POI category if exists
    const currentCategories = poiCategories.get(currentFloorKey) || new Map();
    setTempPOICategory(currentCategories.get(cellKey) || "");

    setShowLabelModal(true);
  };

  // Paint cell function
  const paintCell = (canvasX: number, canvasY: number) => {
    if (!currentFloor) return;

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
        if (paintingAction === "erase") {
          newMap.delete(cellKey);
          setCellLabels((prevLabels) => {
            const newLabelMap = new Map(prevLabels);
            newLabelMap.delete(cellKey);
            return newLabelMap;
          });
          // Remove POI category
          setPOICategories((prevCategories) => {
            const newCategories = new Map(prevCategories);
            const currentFloorCategories =
              newCategories.get(currentFloorKey) || new Map();
            currentFloorCategories.delete(cellKey);
            newCategories.set(currentFloorKey, currentFloorCategories);
            return newCategories;
          });
        } else {
          newMap.set(cellKey, paintColor);

          // Handle special colors
          const colorConfig = NAVIGATION_COLORS.find(
            (c) => c.value === paintColor
          );
          if (colorConfig?.defaultLabel !== undefined) {
            if (colorConfig.defaultLabel === "") {
              // Walkway, elevator, stairs, escalator - empty label
              setCellLabels((prevLabels) => {
                const newLabelMap = new Map(prevLabels);
                newLabelMap.delete(cellKey);
                return newLabelMap;
              });
            }
          }

          // Apply preset labels if available
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
        if (existingColor === paintColor) {
          newMap.delete(cellKey);
          setCellLabels((prevLabels) => {
            const newLabelMap = new Map(prevLabels);
            newLabelMap.delete(cellKey);
            return newLabelMap;
          });
          // Remove POI category
          setPOICategories((prevCategories) => {
            const newCategories = new Map(prevCategories);
            const currentFloorCategories =
              newCategories.get(currentFloorKey) || new Map();
            currentFloorCategories.delete(cellKey);
            newCategories.set(currentFloorKey, currentFloorCategories);
            return newCategories;
          });
        } else {
          newMap.set(cellKey, paintColor);

          // Handle special colors
          const colorConfig = NAVIGATION_COLORS.find(
            (c) => c.value === paintColor
          );
          if (colorConfig?.defaultLabel === "") {
            setCellLabels((prevLabels) => {
              const newLabelMap = new Map(prevLabels);
              newLabelMap.delete(cellKey);
              return newLabelMap;
            });
          }

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
    if (!labelModalCell || !currentFloor) return;

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

    // Handle POI category
    const cellColor = paintedCells.get(cellKey);
    if (cellColor === "#dc2626" && tempPOICategory) {
      setPOICategories((prevCategories) => {
        const newCategories = new Map(prevCategories);
        const currentFloorCategories =
          newCategories.get(currentFloorKey) || new Map();
        currentFloorCategories.set(cellKey, tempPOICategory);
        newCategories.set(currentFloorKey, currentFloorCategories);
        return newCategories;
      });
    }

    setShowLabelModal(false);
    setLabelModalCell(null);
    setTempLabel("");
    setTempPOICategory("");
  };

  // Clear functions
  const handleClearRequest = (type: "all" | "painted" | "labels") => {
    setClearType(type);
    setShowClearConfirm(true);
  };

  const handleClearConfirm = () => {
    if (clearType === "all" || clearType === "painted") {
      setPaintedCells(new Map());
      // Clear POI categories for current floor
      if (currentFloor) {
        setPOICategories((prev) => {
          const newCategories = new Map(prev);
          newCategories.set(currentFloorKey, new Map());
          return newCategories;
        });
      }
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

  // Image upload - floor specific
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentFloor) {
      alert("Please create or select a floor first!");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    const fileName =
      file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

    const img = new Image();
    img.onload = () => {
      setFloorImages((prev) => {
        const newMap = new Map(prev);
        newMap.set(currentFloorKey, { image: img, name: fileName });
        return newMap;
      });
      setTimeout(() => centerView(), 100);
    };
    img.src = URL.createObjectURL(file);

    // Reset input value to allow same file upload again
    event.target.value = "";
  };

  // Remove image with confirmation - floor specific
  const handleRemoveImageRequest = () => {
    if (!currentFloor) return;
    setShowRemoveImageConfirm(true);
  };

  const handleRemoveImageConfirm = () => {
    if (!currentFloor) return;
    setFloorImages((prev) => {
      const newMap = new Map(prev);
      newMap.delete(currentFloorKey);
      return newMap;
    });
    setShowRemoveImageConfirm(false);
  };

  // JSON import/export for floors
  const handleJSONImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        // Validate and restore floors
        if (jsonData.floors) {
          const newFloors = new Map<string, FloorData>();
          const newPOICategories = new Map<string, Map<string, string>>();

          Object.entries(jsonData.floors).forEach(
            ([key, data]: [string, any]) => {
              const floorData: FloorData = {
                name: data.name,
                number: data.number,
                paintedCells: new Map(data.paintedCells || []),
                cellLabels: new Map(data.cellLabels || []),
                colorPresets: new Map(data.colorPresets || []),
                poiCategories: new Map(data.poiCategories || []),
              };
              newFloors.set(key, floorData);
              newPOICategories.set(key, new Map(data.poiCategories || []));
            }
          );

          setFloors(newFloors);
          setPOICategories(newPOICategories);

          // Restore current floor
          if (jsonData.currentFloor && newFloors.size > 0) {
            setCurrentFloor(jsonData.currentFloor);
            const currentData = newFloors.get(
              `${jsonData.currentFloor.number}_${jsonData.currentFloor.name}`
            );
            if (currentData) {
              setPaintedCells(new Map(currentData.paintedCells));
              setCellLabels(new Map(currentData.cellLabels));
              setColorPresets(new Map(currentData.colorPresets));
            }
          } else if (newFloors.size > 0) {
            // Set first floor as current
            const firstFloor = Array.from(newFloors.values())[0];
            setCurrentFloor({
              name: firstFloor.name,
              number: firstFloor.number,
            });
            setPaintedCells(new Map(firstFloor.paintedCells));
            setCellLabels(new Map(firstFloor.cellLabels));
            setColorPresets(new Map(firstFloor.colorPresets));
          }

          // Restore other settings
          if (jsonData.metadata) {
            const meta = jsonData.metadata;
            if (meta.imageName) setImageName(meta.imageName);
            if (meta.gridSize) setGridSize(meta.gridSize);
            if (meta.zoom) setZoom(meta.zoom);
            if (meta.labelSize) setLabelSize(meta.labelSize);
            if (meta.labelColor) setLabelColor(meta.labelColor);
            if (meta.paintColor) setPaintColor(meta.paintColor);
            if (typeof meta.isGridVisible === "boolean")
              setIsGridVisible(meta.isGridVisible);
            if (typeof meta.labelsVisible === "boolean")
              setLabelsVisible(meta.labelsVisible);
            if (typeof meta.backgroundVisible === "boolean")
              setBackgroundVisible(meta.backgroundVisible);
            if (typeof meta.showConnections === "boolean")
              setShowConnections(meta.showConnections);
            if (meta.gridOffset) setGridOffset(meta.gridOffset);
            if (meta.canvasOffset) setCanvasOffset(meta.canvasOffset);
          }

          alert(`Successfully imported ${newFloors.size} floors!`);
        }
      } catch (error) {
        alert("Error parsing JSON file");
        console.error("JSON import error:", error);
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  // Export functions
  const generateFileName = (extension: string, suffix: string = "") => {
    const parts = [
      "grid-painter",
      imageName,
      currentFloor ? `floor-${currentFloor.number}` : "no-floor",
      suffix,
    ].filter(Boolean);

    return parts.join("_") + extension;
  };

  // Preview CSV export
  const handlePreviewCSV = (type: "current" | "all") => {
    if (floors.size === 0) {
      alert("No floors to export!");
      return;
    }

    if (!currentFloor) return;

    // Save current floor data first
    const currentKey = `${currentFloor.number}_${currentFloor.name}`;
    const updatedFloors = new Map(floors);
    const existing = updatedFloors.get(currentKey) || {
      name: currentFloor.name,
      number: currentFloor.number,
      paintedCells: new Map(),
      cellLabels: new Map(),
      colorPresets: new Map(),
      poiCategories: new Map(),
    };
    updatedFloors.set(currentKey, {
      ...existing,
      paintedCells: new Map(paintedCells),
      cellLabels: new Map(cellLabels),
      colorPresets: new Map(colorPresets),
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const suffix = type === "current" ? "current" : "all";

    // Generate navigation grid CSV for preview
    const navCSV = generateNavigationGridCSV(updatedFloors, type, currentFloor);

    setExportPreviewData({
      type: "csv",
      content: navCSV,
      filename: `navigation_grid_${timestamp}_${suffix}.csv`,
    });
    setShowExportPreview(true);
  };

  // Actual CSV export
  const handleExportCSV = (type: "current" | "all") => {
    if (floors.size === 0) {
      alert("No floors to export!");
      return;
    }

    // Save current floor data first
    if (currentFloor) {
      const currentKey = `${currentFloor.number}_${currentFloor.name}`;
      const updatedFloors = new Map(floors);
      const existing = updatedFloors.get(currentKey) || {
        name: currentFloor.name,
        number: currentFloor.number,
        paintedCells: new Map(),
        cellLabels: new Map(),
        colorPresets: new Map(),
        poiCategories: new Map(),
      };
      updatedFloors.set(currentKey, {
        ...existing,
        paintedCells: new Map(paintedCells),
        cellLabels: new Map(cellLabels),
        colorPresets: new Map(colorPresets),
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      const suffix = type === "current" ? "current" : "all";

      // Generate and download navigation grid CSV
      const navCSV = generateNavigationGridCSV(
        updatedFloors,
        type,
        currentFloor
      );
      downloadCSV(navCSV, `navigation_grid_${timestamp}_${suffix}.csv`);

      // Generate and download POI CSV
      const poiCSV = generatePOICSV(
        updatedFloors,
        poiCategories,
        type,
        currentFloor
      );
      downloadCSV(poiCSV, `points_of_interest_${timestamp}_${suffix}.csv`);

      // Generate and download vertical connections CSV (always all floors)
      const connectionsCSV = generateVerticalConnectionsCSV(updatedFloors);
      downloadCSV(connectionsCSV, `vertical_connections_${timestamp}.csv`);

      setTimeout(() => {
        exportSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Preview JSON export
  const handlePreviewJSON = () => {
    if (floors.size === 0) {
      alert("No floors to export!");
      return;
    }

    if (!currentFloor) return;

    // Save current floor data first
    const currentKey = `${currentFloor.number}_${currentFloor.name}`;
    const updatedFloors = new Map(floors);
    const existing = updatedFloors.get(currentKey) || {
      name: currentFloor.name,
      number: currentFloor.number,
      paintedCells: new Map(),
      cellLabels: new Map(),
      colorPresets: new Map(),
      poiCategories: new Map(),
    };
    updatedFloors.set(currentKey, {
      ...existing,
      paintedCells: new Map(paintedCells),
      cellLabels: new Map(cellLabels),
      colorPresets: new Map(colorPresets),
    });

    const exportData = {
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
        showConnections,
        gridOffset,
        canvasOffset,
        totalFloors: updatedFloors.size,
      },
      currentFloor,
      floors: Object.fromEntries(
        Array.from(updatedFloors.entries()).map(([key, floor]) => [
          key,
          {
            name: floor.name,
            number: floor.number,
            paintedCells: Array.from(floor.paintedCells.entries()),
            cellLabels: Array.from(floor.cellLabels.entries()),
            colorPresets: Array.from(floor.colorPresets.entries()),
            poiCategories: Array.from(
              (poiCategories.get(key) || new Map()).entries()
            ),
          },
        ])
      ),
    };

    const filename = generateFileName(".json", "project");

    setExportPreviewData({
      type: "json",
      content: JSON.stringify(exportData, null, 2),
      filename,
    });
    setShowExportPreview(true);
  };

  // Actual JSON export
  const handleExportJSON = () => {
    if (floors.size === 0) {
      alert("No floors to export!");
      return;
    }

    // Save current floor data first
    if (currentFloor) {
      const currentKey = `${currentFloor.number}_${currentFloor.name}`;
      const updatedFloors = new Map(floors);
      const existing = updatedFloors.get(currentKey) || {
        name: currentFloor.name,
        number: currentFloor.number,
        paintedCells: new Map(),
        cellLabels: new Map(),
        colorPresets: new Map(),
        poiCategories: new Map(),
      };
      updatedFloors.set(currentKey, {
        ...existing,
        paintedCells: new Map(paintedCells),
        cellLabels: new Map(cellLabels),
        colorPresets: new Map(colorPresets),
      });

      const exportData = {
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
          showConnections,
          gridOffset,
          canvasOffset,
          totalFloors: updatedFloors.size,
        },
        currentFloor,
        floors: Object.fromEntries(
          Array.from(updatedFloors.entries()).map(([key, floor]) => [
            key,
            {
              name: floor.name,
              number: floor.number,
              paintedCells: Array.from(floor.paintedCells.entries()),
              cellLabels: Array.from(floor.cellLabels.entries()),
              colorPresets: Array.from(floor.colorPresets.entries()),
              poiCategories: Array.from(
                (poiCategories.get(key) || new Map()).entries()
              ),
            },
          ])
        ),
      };

      const filename = generateFileName(".json", "project");
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
    }
  };

  // Preview PNG export
  const handlePreviewPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = exportCanvasToPNG(canvas);
    const filename = generateFileName(".png", "canvas");

    setExportPreviewData({
      type: "png",
      content: dataUrl,
      filename,
    });
    setShowExportPreview(true);
  };

  // Actual PNG export
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = exportCanvasToPNG(canvas);
    const filename = generateFileName(".png", "canvas");
    downloadPNG(dataUrl, filename);
  };

  // Export preview download handler
  const handleExportPreviewDownload = () => {
    if (exportPreviewData.type === "csv") {
      downloadCSV(exportPreviewData.content, exportPreviewData.filename);
    } else if (exportPreviewData.type === "json") {
      const blob = new Blob([exportPreviewData.content], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.download = exportPreviewData.filename;
      link.href = URL.createObjectURL(blob);
      link.click();
    } else if (exportPreviewData.type === "png") {
      downloadPNG(exportPreviewData.content, exportPreviewData.filename);
    }
    setShowExportPreview(false);
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
            Grid Painter
          </h1>

          {/* Upload Section - Full Width */}
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
              Upload & Import
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
                title="Import JSON project file (.json) exported from Grid Painter. This will restore all floors, settings, and painted data."
              >
                <Icons.FileText size={16} />
                Import Project (.json)
              </label>

              {backgroundImage && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      color: "#10b981",
                      fontSize: "14px",
                      padding: "8px 12px",
                      backgroundColor: "#064e3b",
                      border: "1px solid #10b981",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    ✅ Image loaded: {currentImageName}
                  </div>

                  {/* Statistics below canvas - horizontal layout */}
                  {currentFloor && (
                    <div
                      style={{
                        backgroundColor: "#262626",
                        border: "1px solid #404040",
                        padding: "12px 16px",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "24px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#16a34a",
                            color: "#fff",
                            padding: "4px 10px",
                            fontSize: "12px",
                            fontWeight: "600",
                            borderRadius: "4px",
                            minWidth: "24px",
                            textAlign: "center",
                          }}
                        >
                          {
                            Array.from(paintedCells.entries()).filter(
                              ([_, color]) => color === "#16a34a"
                            ).length
                          }
                        </div>
                        <span
                          style={{
                            color: "#ccc",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          Walkways
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#dc2626",
                            color: "#fff",
                            padding: "4px 10px",
                            fontSize: "12px",
                            fontWeight: "600",
                            borderRadius: "4px",
                            minWidth: "24px",
                            textAlign: "center",
                          }}
                        >
                          {
                            Array.from(paintedCells.entries()).filter(
                              ([_, color]) => color === "#dc2626"
                            ).length
                          }
                        </div>
                        <span
                          style={{
                            color: "#ccc",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          POIs
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#2563eb",
                            color: "#fff",
                            padding: "4px 10px",
                            fontSize: "12px",
                            fontWeight: "600",
                            borderRadius: "4px",
                            minWidth: "24px",
                            textAlign: "center",
                          }}
                        >
                          {
                            Array.from(paintedCells.entries()).filter(
                              ([_, color]) =>
                                ["#2563eb", "#ea580c", "#7c3aed"].includes(
                                  color
                                )
                            ).length
                          }
                        </div>
                        <span
                          style={{
                            color: "#ccc",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          Vertical Connections
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#16a34a",
                            color: "#fff",
                            padding: "4px 10px",
                            fontSize: "12px",
                            fontWeight: "600",
                            borderRadius: "4px",
                            minWidth: "24px",
                            textAlign: "center",
                          }}
                        >
                          {cellLabels.size}
                        </div>
                        <span
                          style={{
                            color: "#ccc",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          Labeled Cells
                        </span>
                      </div>

                      {backgroundImage && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#7c3aed",
                              color: "#fff",
                              padding: "4px 10px",
                              fontSize: "12px",
                              fontWeight: "600",
                              borderRadius: "4px",
                            }}
                          >
                            📷
                          </div>
                          <span
                            style={{
                              color: "#ccc",
                              fontSize: "13px",
                              fontWeight: "500",
                            }}
                          >
                            {currentImageName}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleRemoveImageRequest}
                    style={{
                      ...styles.button,
                      ...styles.dangerButton,
                      fontSize: "12px",
                      padding: "8px 12px",
                    }}
                  >
                    <Icons.X size={14} />
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Floor Management moved to top, horizontal layout */}
          <FloorManagement
            currentFloor={currentFloor}
            floors={floors}
            onCreateFloor={createFloor}
            onSwitchFloor={switchFloor}
            onDeleteFloor={deleteFloor}
            onEditFloor={editFloor}
            paintedCells={paintedCells}
            cellLabels={cellLabels}
          />

          {/* Main Layout: Compact Left Controls + Canvas + Right Colors */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "240px 1fr 240px",
              gap: "12px",
              marginBottom: "20px",
              alignItems: "start",
            }}
          >
            {/* Left Side - Compact Controls */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <GridSettings
                gridSize={gridSize}
                setGridSize={setGridSize}
                isGridVisible={isGridVisible}
                setIsGridVisible={setIsGridVisible}
                labelsVisible={labelsVisible}
                setLabelsVisible={setLabelsVisible}
                backgroundVisible={backgroundVisible}
                setBackgroundVisible={setBackgroundVisible}
                showConnections={showConnections}
                setShowConnections={setShowConnections}
                showPrimaryConnections={showPrimaryConnections}
                setShowPrimaryConnections={setShowPrimaryConnections}
                showSecondaryConnections={showSecondaryConnections}
                setShowSecondaryConnections={setShowSecondaryConnections}
                showCornerIndicators={showCornerIndicators}
                setShowCornerIndicators={setShowCornerIndicators}
                labelSize={labelSize}
                setLabelSize={setLabelSize}
                gridOffset={gridOffset}
                setGridOffset={setGridOffset}
              />

              <ViewControls
                zoom={zoom}
                setZoom={setZoom}
                centerView={centerView}
              />
            </div>

            {/* Center - Canvas */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "16px 8px", // Reduced horizontal padding
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
                      : currentFloor
                      ? "default"
                      : "not-allowed",
                    backgroundColor: "#000000",
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: "600px",
                  }}
                />
              </div>
            </div>

            {/* Right Side - Enhanced Color Palette */}
            <ColorPalette
              colors={NAVIGATION_COLORS}
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
          </div>

          {/* Action Buttons with Preview options */}
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
            {/* Export Preview Buttons */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => handlePreviewCSV("current")}
                disabled={!currentFloor}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  opacity: !currentFloor ? 0.5 : 1,
                  fontSize: "12px",
                }}
              >
                <Icons.FileText size={14} />
                Preview CSV
              </button>

              <button
                onClick={handlePreviewJSON}
                disabled={floors.size === 0}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  opacity: floors.size === 0 ? 0.5 : 1,
                  fontSize: "12px",
                }}
              >
                <Icons.FileText size={14} />
                Preview JSON
              </button>

              <button
                onClick={handlePreviewPNG}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  fontSize: "12px",
                }}
              >
                <Icons.FileText size={14} />
                Preview PNG
              </button>
            </div>

            {/* Separator */}
            <div
              style={{
                width: "1px",
                backgroundColor: "#555",
                margin: "0 8px",
                alignSelf: "stretch",
              }}
            />

            {/* Export Direct Buttons */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => handleExportCSV("current")}
                disabled={!currentFloor}
                style={{
                  ...styles.button,
                  ...styles.successButton,
                  opacity: !currentFloor ? 0.5 : 1,
                  fontSize: "12px",
                }}
              >
                <Icons.Download size={14} />
                Export CSV
              </button>

              <button
                onClick={handleExportJSON}
                disabled={floors.size === 0}
                style={{
                  ...styles.button,
                  ...styles.successButton,
                  opacity: floors.size === 0 ? 0.5 : 1,
                  fontSize: "12px",
                }}
              >
                <Icons.Download size={14} />
                Export JSON
              </button>

              <button
                onClick={handleExportPNG}
                style={{
                  ...styles.button,
                  ...styles.successButton,
                  fontSize: "12px",
                }}
              >
                <Icons.Download size={14} />
                Export PNG
              </button>
            </div>

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
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => handleClearRequest("painted")}
                disabled={!currentFloor}
                style={{
                  ...styles.button,
                  ...styles.warningButton,
                  opacity: !currentFloor ? 0.5 : 1,
                  fontSize: "12px",
                }}
              >
                <Icons.RotateCcw size={14} />
                Clear Painted
              </button>

              <button
                onClick={() => handleClearRequest("labels")}
                disabled={!currentFloor}
                style={{
                  ...styles.button,
                  ...styles.warningButton,
                  opacity: !currentFloor ? 0.5 : 1,
                  fontSize: "12px",
                }}
              >
                <Icons.Type size={14} />
                Clear Labels
              </button>

              <button
                onClick={() => handleClearRequest("all")}
                disabled={!currentFloor}
                style={{
                  ...styles.button,
                  ...styles.dangerButton,
                  opacity: !currentFloor ? 0.5 : 1,
                  fontSize: "12px",
                }}
              >
                <Icons.X size={14} />
                Clear All
              </button>
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
              How to Use Grid Painter:
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
                <strong>🏢 Create Floors:</strong> Start by creating your first
                floor
              </li>
              <li>
                <strong>🟢 Walkway (Green):</strong> Mark navigable paths
              </li>
              <li>
                <strong>🔴 POI (Red):</strong> Mark points of interest,
                right-click to name and categorize
              </li>
              <li>
                <strong>🔵 Elevator:</strong> Right-click to assign connection
                ID (e.g., ELV_001)
              </li>
              <li>
                <strong>🟠 Stairs:</strong> Right-click to assign connection ID
                (e.g., STR_001)
              </li>
              <li>
                <strong>🟣 Escalator:</strong> Right-click to assign connection
                ID (e.g., ESC_001)
              </li>
              <li>
                <strong>Connection Lines:</strong> Toggle to see walkway
                connections (smart pathfinding)
              </li>
              <li>
                <strong>Export:</strong> Generates 3 CSV files: Navigation Grid
                (pathfinding data), Points of Interest (POI locations), and
                Vertical Connections (elevator/stairs between floors)
              </li>
              <li>
                <strong>Controls:</strong> Ctrl+drag to pan, Ctrl+wheel to zoom,
                right-click to label
              </li>
            </ul>
          </div>

          {/* Export Preview */}
          {currentFloor && (
            <div ref={exportSectionRef} style={styles.dataContainer}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#ffffff",
                  marginBottom: "20px",
                }}
              >
                Export Preview - 3 CSV Files Generated
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "20px",
                }}
              >
                <div style={styles.dataBox}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#10b981",
                      marginBottom: "12px",
                    }}
                  >
                    📊 Navigation Grid CSV (Current Floor)
                  </h3>
                  <div style={{ color: "#ccc", fontSize: "14px" }}>
                    • Floor: {currentFloor.name} (#{currentFloor.number})
                    <br />•{" "}
                    {
                      Array.from(paintedCells.entries()).filter(
                        ([_, color]) => color === "#16a34a"
                      ).length
                    }{" "}
                    walkway cells
                    <br />•{" "}
                    {
                      Array.from(paintedCells.entries()).filter(([_, color]) =>
                        ["#2563eb", "#ea580c", "#7c3aed"].includes(color)
                      ).length
                    }{" "}
                    connection points
                    <br />• AI pathfinding data with 4-way priority
                  </div>
                </div>

                <div style={styles.dataBox}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#dc2626",
                      marginBottom: "12px",
                    }}
                  >
                    📍 Points of Interest CSV (Current Floor)
                  </h3>
                  <div style={{ color: "#ccc", fontSize: "14px" }}>
                    •{" "}
                    {
                      Array.from(paintedCells.entries()).filter(
                        ([_, color]) => color === "#dc2626"
                      ).length
                    }{" "}
                    POI locations
                    <br />•{" "}
                    {
                      (poiCategories.get(currentFloorKey) || new Map()).size
                    }{" "}
                    categorized POIs
                    <br />• Names, categories, coordinates
                  </div>
                </div>

                <div style={styles.dataBox}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#7c3aed",
                      marginBottom: "12px",
                    }}
                  >
                    🏢 Vertical Connections CSV
                  </h3>
                  <div style={{ color: "#ccc", fontSize: "14px" }}>
                    • {floors.size} total floors
                    <br />• Elevators, stairs, escalators
                    <br />• Cross-floor navigation data
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Preview Modal */}
      <ExportPreviewModal
        isOpen={showExportPreview}
        onClose={() => setShowExportPreview(false)}
        exportType={exportPreviewData.type}
        content={exportPreviewData.content}
        onDownload={handleExportPreviewDownload}
        filename={exportPreviewData.filename}
      />

      {/* Remove Image Confirmation Modal */}
      {showRemoveImageConfirm && (
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
              Remove Background Image
            </h3>
            <p style={{ color: "#ccc", marginBottom: "20px" }}>
              Are you sure you want to remove the background image "
              {currentImageName}"?
              <br />
              <span style={{ color: "#fbbf24" }}>
                You can upload a new image anytime.
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
                onClick={() => setShowRemoveImageConfirm(false)}
                style={styles.button}
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveImageConfirm}
                style={{ ...styles.button, ...styles.dangerButton }}
              >
                Remove Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
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
              Edit Cell Label
            </h3>
            <p
              style={{ color: "#ccc", marginBottom: "12px", fontSize: "14px" }}
            >
              Cell: ({labelModalCell?.row}, {labelModalCell?.col}) on{" "}
              {currentFloor?.name}
            </p>

            {/* Name Input */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  color: "#ccc",
                  fontSize: "14px",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Name/ID:
              </label>
              <input
                type="text"
                value={tempLabel}
                onChange={(e) => setTempLabel(e.target.value)}
                placeholder="Enter name or connection ID (e.g., ELV_001)"
                style={{ ...styles.input, width: "100%" }}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleLabelSubmit()}
              />
            </div>

            {/* POI Category (only for POI cells) */}
            {labelModalCell &&
              paintedCells.get(
                coordsToKey(labelModalCell.row, labelModalCell.col)
              ) === "#dc2626" && (
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      color: "#fbbf24",
                      fontSize: "14px",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    📍 POI Category:
                  </label>
                  <select
                    value={tempPOICategory}
                    onChange={(e) => setTempPOICategory(e.target.value)}
                    style={{ ...styles.input, width: "100%" }}
                  >
                    <option value="">Select Category...</option>
                    {POI_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                : "labels"}{" "}
              on {currentFloor?.name}? This action cannot be undone.
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
              {NAVIGATION_COLORS.find((c) => c.value === presetColor)?.name ||
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
