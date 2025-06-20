// Canvas utility functions for Indoor Navigation Grid Tool

import {
  NavigationGridRow,
  POIRow,
  VerticalConnectionRow,
  DIRECTIONS,
  FloorData,
} from "./constants";

export const coordsToKey = (row: number, col: number): string =>
  `${row},${col}`;

export const keyToCoords = (cellKey: string): { row: number; col: number } => {
  const [row, col] = cellKey.split(",").map(Number);
  return { row, col };
};

export const canvasToGridCoords = (
  canvasX: number,
  canvasY: number,
  canvasOffset: { x: number; y: number },
  zoom: number,
  gridOffset: { x: number; y: number },
  gridSize: number
): { col: number; row: number } => {
  const worldX = (canvasX - canvasOffset.x) / zoom;
  const worldY = (canvasY - canvasOffset.y) / zoom;

  const col = Math.floor((worldX - gridOffset.x) / gridSize);
  const row = Math.floor((worldY - gridOffset.y) / gridSize);

  return { col, row };
};

export const gridToCanvasCoords = (
  row: number,
  col: number,
  gridOffset: { x: number; y: number },
  gridSize: number
): { x: number; y: number } => {
  return {
    x: col * gridSize + gridOffset.x,
    y: row * gridSize + gridOffset.y,
  };
};

export const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#1f2937" : "#ffffff";
};

export const resizeImageToFit = (
  img: HTMLImageElement,
  maxWidth: number = 1000,
  maxHeight: number = 700
): { width: number; height: number } => {
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
  return {
    width: img.width * ratio,
    height: img.height * ratio,
  };
};

// Get smart connections - both 4-way and diagonal
// Get smart connections - 4-way priority, diagonal as fallback only
export const getSmartConnections = (
  row: number,
  col: number,
  paintedCells: Map<string, string>
): { direction: string; row: number; col: number }[] => {
  const walkwayColor = "#16a34a";
  const connections: { direction: string; row: number; col: number }[] = [];

  // 4-way directions (primary - always preferred)
  const primary = [
    { name: "kuzey", dr: -1, dc: 0 },
    { name: "güney", dr: 1, dc: 0 },
    { name: "doğu", dr: 0, dc: 1 },
    { name: "batı", dr: 0, dc: -1 },
  ];

  // Diagonal directions (fallback only)
  const secondary = [
    { name: "kuzeydoğu", dr: -1, dc: 1 },
    { name: "kuzeybatı", dr: -1, dc: -1 },
    { name: "güneydoğu", dr: 1, dc: 1 },
    { name: "güneybatı", dr: 1, dc: -1 },
  ];

  // Always add 4-way connections first
  primary.forEach((dir) => {
    const newRow = row + dir.dr;
    const newCol = col + dir.dc;
    const key = coordsToKey(newRow, newCol);

    if (paintedCells.get(key) === walkwayColor) {
      connections.push({
        direction: dir.name,
        row: newRow,
        col: newCol,
      });
    }
  });

  // Add diagonal connections ONLY if no 4-way path exists to that cell
  secondary.forEach((dir) => {
    const newRow = row + dir.dr;
    const newCol = col + dir.dc;
    const key = coordsToKey(newRow, newCol);

    if (paintedCells.get(key) === walkwayColor) {
      // Check if this diagonal destination can be reached via 4-way path
      const canReachVia4Way = canReachDiagonalVia4Way(
        row,
        col,
        newRow,
        newCol,
        paintedCells
      );

      // Only add diagonal if 4-way path doesn't exist
      if (!canReachVia4Way) {
        connections.push({
          direction: dir.name,
          row: newRow,
          col: newCol,
        });
      }
    }
  });

  return connections;
};

// Helper function to check if diagonal destination is reachable via 4-way movement
const canReachDiagonalVia4Way = (
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  paintedCells: Map<string, string>
): boolean => {
  const walkwayColor = "#16a34a";

  // Calculate the difference
  const deltaRow = toRow - fromRow;
  const deltaCol = toCol - fromCol;

  // For diagonal movement, check both possible 4-way paths
  // Path 1: Move row first, then column
  const path1Row = fromRow + deltaRow;
  const path1Col = fromCol;
  const path1Key = coordsToKey(path1Row, path1Col);
  const path1Valid = paintedCells.get(path1Key) === walkwayColor;

  // Path 2: Move column first, then row
  const path2Row = fromRow;
  const path2Col = fromCol + deltaCol;
  const path2Key = coordsToKey(path2Row, path2Col);
  const path2Valid = paintedCells.get(path2Key) === walkwayColor;

  // If either 4-way path exists, diagonal is not needed
  return path1Valid || path2Valid;
};

// Helper function to detect sharp corners
const checkForSharpCorner = (
  row: number,
  col: number,
  direction: { name: string; dr: number; dc: number },
  paintedCells: Map<string, string>
): boolean => {
  const walkwayColor = "#16a34a";

  // For diagonal movement, check if adjacent 4-way cells exist
  // If they do, this creates a sharp corner that should use 4-way movement instead

  if (direction.name === "kuzeydoğu") {
    const north = paintedCells.get(coordsToKey(row - 1, col)) === walkwayColor;
    const east = paintedCells.get(coordsToKey(row, col + 1)) === walkwayColor;
    return north && east; // Sharp corner: better to go north then east
  }

  if (direction.name === "kuzeybatı") {
    const north = paintedCells.get(coordsToKey(row - 1, col)) === walkwayColor;
    const west = paintedCells.get(coordsToKey(row, col - 1)) === walkwayColor;
    return north && west;
  }

  if (direction.name === "güneydoğu") {
    const south = paintedCells.get(coordsToKey(row + 1, col)) === walkwayColor;
    const east = paintedCells.get(coordsToKey(row, col + 1)) === walkwayColor;
    return south && east;
  }

  if (direction.name === "güneybatı") {
    const south = paintedCells.get(coordsToKey(row + 1, col)) === walkwayColor;
    const west = paintedCells.get(coordsToKey(row, col - 1)) === walkwayColor;
    return south && west;
  }

  return false;
};

// Grid drawing function
export const drawCanvasGrid = (
  ctx: CanvasRenderingContext2D,
  canvasSize: { width: number; height: number },
  gridOffset: { x: number; y: number },
  gridSize: number,
  isVisible: boolean,
  zoom: number,
  canvasOffset: { x: number; y: number }
): void => {
  if (!isVisible) return;

  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 0.5 / zoom;
  ctx.globalAlpha = 0.7;

  const visibleLeft = -canvasOffset.x / zoom;
  const visibleTop = -canvasOffset.y / zoom;
  const visibleRight = visibleLeft + canvasSize.width / zoom;
  const visibleBottom = visibleTop + canvasSize.height / zoom;

  const startCol = Math.floor((visibleLeft - gridOffset.x) / gridSize);
  const endCol = Math.ceil((visibleRight - gridOffset.x) / gridSize);
  const startRow = Math.floor((visibleTop - gridOffset.y) / gridSize);
  const endRow = Math.ceil((visibleBottom - gridOffset.y) / gridSize);

  // Vertical lines
  ctx.beginPath();
  for (let col = startCol; col <= endCol; col++) {
    const x = col * gridSize + gridOffset.x;
    ctx.moveTo(x, visibleTop);
    ctx.lineTo(x, visibleBottom);
  }
  ctx.stroke();

  // Horizontal lines
  ctx.beginPath();
  for (let row = startRow; row <= endRow; row++) {
    const y = row * gridSize + gridOffset.y;
    ctx.moveTo(visibleLeft, y);
    ctx.lineTo(visibleRight, y);
  }
  ctx.stroke();

  ctx.globalAlpha = 1;
};

// Simplified connection lines - just green lines for all connections
export const drawConnectionLines = (
  ctx: CanvasRenderingContext2D,
  paintedCells: Map<string, string>,
  canvasSize: { width: number; height: number },
  gridOffset: { x: number; y: number },
  gridSize: number,
  isVisible: boolean,
  zoom: number,
  canvasOffset: { x: number; y: number }
): void => {
  if (!isVisible) return;

  const walkwayColor = "#16a34a";
  const visibleLeft = -canvasOffset.x / zoom;
  const visibleTop = -canvasOffset.y / zoom;
  const visibleRight = visibleLeft + canvasSize.width / zoom;
  const visibleBottom = visibleTop + canvasSize.height / zoom;

  ctx.strokeStyle = "#10b981"; // Green color for all connections
  ctx.lineWidth = 2 / zoom;
  ctx.globalAlpha = 0.7;
  ctx.setLineDash([]); // Solid line for all connections

  paintedCells.forEach((color, cellKey) => {
    if (color !== walkwayColor) return;

    const { row, col } = keyToCoords(cellKey);
    const { x: centerX, y: centerY } = gridToCanvasCoords(
      row,
      col,
      gridOffset,
      gridSize
    );
    const cellCenterX = centerX + gridSize / 2;
    const cellCenterY = centerY + gridSize / 2;

    // Only draw if cell is visible
    if (
      centerX + gridSize >= visibleLeft &&
      centerX <= visibleRight &&
      centerY + gridSize >= visibleTop &&
      centerY <= visibleBottom
    ) {
      // Get all smart connections (both 4-way and diagonal when appropriate)
      const connections = getSmartConnections(row, col, paintedCells);

      connections.forEach((adj) => {
        const { x: adjX, y: adjY } = gridToCanvasCoords(
          adj.row,
          adj.col,
          gridOffset,
          gridSize
        );
        const adjCenterX = adjX + gridSize / 2;
        const adjCenterY = adjY + gridSize / 2;

        ctx.beginPath();
        ctx.moveTo(cellCenterX, cellCenterY);
        ctx.lineTo(adjCenterX, adjCenterY);
        ctx.stroke();
      });
    }
  });

  ctx.globalAlpha = 1;
  ctx.setLineDash([]); // Reset
};

// Painted cells drawing with label indicators
export const drawPaintedCells = (
  ctx: CanvasRenderingContext2D,
  paintedCells: Map<string, string>,
  canvasSize: { width: number; height: number },
  gridOffset: { x: number; y: number },
  gridSize: number,
  zoom: number,
  canvasOffset: { x: number; y: number },
  cellLabels: Map<string, string[]>
): void => {
  const visibleLeft = -canvasOffset.x / zoom;
  const visibleTop = -canvasOffset.y / zoom;
  const visibleRight = visibleLeft + canvasSize.width / zoom;
  const visibleBottom = visibleTop + canvasSize.height / zoom;

  paintedCells.forEach((cellColor, cellKey) => {
    const { row, col } = keyToCoords(cellKey);
    const { x: drawX, y: drawY } = gridToCanvasCoords(
      row,
      col,
      gridOffset,
      gridSize
    );

    if (
      drawX + gridSize >= visibleLeft &&
      drawX <= visibleRight &&
      drawY + gridSize >= visibleTop &&
      drawY <= visibleBottom
    ) {
      // Main cell color
      ctx.fillStyle = cellColor + "80"; // 50% transparency
      ctx.fillRect(drawX, drawY, gridSize, gridSize);

      // Check if cell has labels
      const hasLabel =
        cellLabels.has(cellKey) && cellLabels.get(cellKey)!.length > 0;
      const isWalkway = cellColor === "#16a34a";

      // Connection type indicators
      const connectionTypes = ["#2563eb", "#ea580c", "#7c3aed"]; // elevator, stairs, escalator
      if (connectionTypes.includes(cellColor)) {
        const symbols = { "#2563eb": "🚇", "#ea580c": "🚶", "#7c3aed": "🔺" };
        const symbol = symbols[cellColor as keyof typeof symbols];

        if (hasLabel) {
          // Show connection symbol
          ctx.fillStyle = "#ffffff";
          ctx.font = `${Math.max(8, gridSize * 0.4)}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(symbol, drawX + gridSize / 2, drawY + gridSize / 2);
        } else {
          // Show "?" for unlabeled connections
          ctx.fillStyle = "#ffff00"; // Yellow for attention
          ctx.font = `bold ${Math.max(10, gridSize * 0.5)}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("?", drawX + gridSize / 2, drawY + gridSize / 2);
        }
      }
      // POI indicator - simge üstte, label altta
      else if (cellColor === "#dc2626") {
        if (hasLabel) {
          // Show POI symbol in upper part
          ctx.fillStyle = "#ffffff";
          ctx.font = `${Math.max(8, gridSize * 0.3)}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("📍", drawX + gridSize / 2, drawY + gridSize * 0.3);

          // Labels are handled separately in drawCellLabels function
          // and will be positioned in the lower part
        } else {
          // Show "?" for unlabeled POIs in center
          ctx.fillStyle = "#ffff00"; // Yellow for attention
          ctx.font = `bold ${Math.max(10, gridSize * 0.5)}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("?", drawX + gridSize / 2, drawY + gridSize / 2);
        }
      }
      // Walkway cells - no indicators needed (they're supposed to be unlabeled)
      else if (isWalkway) {
        // Walkways don't need labels, so no indicator needed
      }
      // Other colored cells without labels
      else if (!hasLabel) {
        // Show "?" for any other unlabeled colored cell
        ctx.fillStyle = "#ffff00"; // Yellow for attention
        ctx.font = `bold ${Math.max(10, gridSize * 0.5)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", drawX + gridSize / 2, drawY + gridSize / 2);
      }
      // Labeled non-walkway cells - show small dot to indicate labeled
      else if (hasLabel && !isWalkway) {
        const r = parseInt(cellColor.slice(1, 3), 16);
        const g = parseInt(cellColor.slice(3, 5), 16);
        const b = parseInt(cellColor.slice(5, 7), 16);
        const darkerColor = `rgb(${Math.floor(r * 0.6)}, ${Math.floor(
          g * 0.6
        )}, ${Math.floor(b * 0.6)})`;

        ctx.fillStyle = darkerColor;
        const centerSize = Math.max(3, gridSize * 0.2);
        const centerX = drawX + (gridSize - centerSize) / 2;
        const centerY = drawY + (gridSize - centerSize) / 2;
        ctx.fillRect(centerX, centerY, centerSize, centerSize);
      }
    }
  });
};

// Cell labels drawing with POI special positioning
export const drawCellLabels = (
  ctx: CanvasRenderingContext2D,
  cellLabels: Map<string, string[]>,
  paintedCells: Map<string, string>,
  canvasSize: { width: number; height: number },
  gridOffset: { x: number; y: number },
  gridSize: number,
  isVisible: boolean,
  zoom: number,
  labelColor: string,
  canvasOffset: { x: number; y: number },
  labelSize: number
): void => {
  if (!isVisible) return;

  const visibleLeft = -canvasOffset.x / zoom;
  const visibleTop = -canvasOffset.y / zoom;
  const visibleRight = visibleLeft + canvasSize.width / zoom;
  const visibleBottom = visibleTop + canvasSize.height / zoom;

  cellLabels.forEach((labels, cellKey) => {
    const { row, col } = keyToCoords(cellKey);
    const { x: drawX, y: drawY } = gridToCanvasCoords(
      row,
      col,
      gridOffset,
      gridSize
    );

    if (
      drawX + gridSize >= visibleLeft &&
      drawX <= visibleRight &&
      drawY + gridSize >= visibleTop &&
      drawY <= visibleBottom
    ) {
      const fontSize = Math.max(1, labelSize / Math.max(zoom * 0.7, 1));

      ctx.font = `${fontSize}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const cellColor = paintedCells.get(cellKey);
      const hasBackground = !!cellColor;
      const labelText = labels.join(", ");
      const isPOI = cellColor === "#dc2626";

      if (!hasBackground) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(drawX + 2, drawY + 2, gridSize - 4, gridSize - 4);
      }

      ctx.fillStyle = hasBackground ? getContrastColor(cellColor) : labelColor;

      // POI labels in lower part to avoid overlap with 📍 symbol
      if (isPOI) {
        // Position label in the lower 70% of the cell
        ctx.fillText(labelText, drawX + gridSize / 2, drawY + gridSize * 0.75);
      } else {
        // Normal center positioning for other cells
        ctx.fillText(labelText, drawX + gridSize / 2, drawY + gridSize / 2);
      }
    }
  });
};

// Export canvas as PNG
export const exportCanvasToPNG = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL("image/png");
};

// CSV Export Functions

export const generateNavigationGridCSV = (
  floors: Map<string, FloorData>,
  exportOption: "current" | "all",
  currentFloor?: { name: string; number: number }
): string => {
  const rows: NavigationGridRow[] = [];
  const headers = [
    "row",
    "col",
    "floor_name",
    "floor_number",
    "walkable",
    "connection_type",
    "connection_id",
  ];

  const csvContent = [
    "# Grid Painter Navigation Data",
    "# PATHFINDING_RULES: 4way_priority,diagonal_last_resort,sharp_turns_preferred",
    "# Use 4-way movement (N,S,E,W) as primary choice",
    "# Use diagonal (NE,NW,SE,SW) only when no 4-way alternative exists",
    "# Prefer 'turn right, go forward' over 'go northeast'",
    headers.join(","),
  ];

  const floorsToProcess =
    exportOption === "current" && currentFloor
      ? [
          {
            key: `${currentFloor.number}_${currentFloor.name}`,
            data: floors.get(`${currentFloor.number}_${currentFloor.name}`)!,
          },
        ]
      : Array.from(floors.entries()).map(([key, data]) => ({ key, data }));

  floorsToProcess.forEach(({ data: floor }) => {
    // Get all painted cells and add walkable info
    const allCells = new Set<string>();
    floor.paintedCells.forEach((_, key) => allCells.add(key));
    floor.cellLabels.forEach((_, key) => allCells.add(key));

    allCells.forEach((cellKey) => {
      const { row, col } = keyToCoords(cellKey);
      const cellColor = floor.paintedCells.get(cellKey);
      const cellLabels = floor.cellLabels.get(cellKey) || [];

      // Determine if walkable
      const walkable = cellColor === "#16a34a"; // walkway color

      // Determine connection type and ID
      let connectionType = "";
      let connectionId = "";

      const connectionColors = {
        "#2563eb": "elevator",
        "#ea580c": "stairs",
        "#7c3aed": "escalator",
      };

      if (
        cellColor &&
        connectionColors[cellColor as keyof typeof connectionColors]
      ) {
        connectionType =
          connectionColors[cellColor as keyof typeof connectionColors];
        // Extract connection ID from labels (first label assumed to be ID)
        connectionId = cellLabels[0] || "";
      }

      rows.push({
        row,
        col,
        floor_name: floor.name,
        floor_number: floor.number,
        walkable,
        connection_type: connectionType,
        connection_id: connectionId,
      });
    });
  });

  // Sort by floor, then row, then col
  rows.sort(
    (a, b) => a.floor_number - b.floor_number || a.row - b.row || a.col - b.col
  );

  // Add data rows to CSV content
  rows.forEach((row) => {
    csvContent.push(
      [
        row.row,
        row.col,
        `"${row.floor_name}"`,
        row.floor_number,
        row.walkable,
        `"${row.connection_type}"`,
        `"${row.connection_id}"`,
      ].join(",")
    );
  });

  return csvContent.join("\n");
};

export const generatePOICSV = (
  floors: Map<string, FloorData>,
  poiCategories: Map<string, Map<string, string>>, // floorKey -> cellKey -> category
  exportOption: "current" | "all",
  currentFloor?: { name: string; number: number }
): string => {
  const rows: POIRow[] = [];
  const headers = [
    "poi_id",
    "name",
    "display_name",
    "row",
    "col",
    "floor_name",
    "floor_number",
    "category",
  ];

  const floorsToProcess =
    exportOption === "current" && currentFloor
      ? [
          {
            key: `${currentFloor.number}_${currentFloor.name}`,
            data: floors.get(`${currentFloor.number}_${currentFloor.name}`)!,
          },
        ]
      : Array.from(floors.entries()).map(([key, data]) => ({ key, data }));

  let poiCounter = 1;

  floorsToProcess.forEach(({ key: floorKey, data: floor }) => {
    const floorCategories = poiCategories.get(floorKey) || new Map();

    floor.paintedCells.forEach((cellColor, cellKey) => {
      // Only process POI cells (red color)
      if (cellColor === "#dc2626") {
        const { row, col } = keyToCoords(cellKey);
        const cellLabels = floor.cellLabels.get(cellKey) || [];
        const category = floorCategories.get(cellKey) || "";
        const name = cellLabels.join(", ") || `POI_${poiCounter}`;

        rows.push({
          poi_id: `POI_${String(poiCounter).padStart(3, "0")}`,
          name,
          display_name: name,
          row,
          col,
          floor_name: floor.name,
          floor_number: floor.number,
          category,
        });

        poiCounter++;
      }
    });
  });

  // Sort by floor, then row, then col
  rows.sort(
    (a, b) => a.floor_number - b.floor_number || a.row - b.row || a.col - b.col
  );

  const csvContent = [headers.join(",")];
  rows.forEach((row) => {
    csvContent.push(
      [
        `"${row.poi_id}"`,
        `"${row.name}"`,
        `"${row.display_name}"`,
        row.row,
        row.col,
        `"${row.floor_name}"`,
        row.floor_number,
        `"${row.category}"`,
      ].join(",")
    );
  });

  return csvContent.join("\n");
};

export const generateVerticalConnectionsCSV = (
  floors: Map<string, FloorData>
): string => {
  const connections = new Map<string, VerticalConnectionRow>();
  const headers = [
    "connection_id",
    "type",
    "floors",
    "travel_time_seconds",
    "floor_numbers",
  ];

  // Collect all connection IDs and their floors
  floors.forEach((floor, floorKey) => {
    floor.paintedCells.forEach((cellColor, cellKey) => {
      const connectionTypes = {
        "#2563eb": "elevator",
        "#ea580c": "stairs",
        "#7c3aed": "escalator",
      };

      if (connectionTypes[cellColor as keyof typeof connectionTypes]) {
        const cellLabels = floor.cellLabels.get(cellKey) || [];
        const connectionId = cellLabels[0]; // First label is connection ID

        if (connectionId) {
          const type =
            connectionTypes[cellColor as keyof typeof connectionTypes];

          if (connections.has(connectionId)) {
            const existing = connections.get(connectionId)!;
            existing.floors += `,${floor.name}`;
            existing.floor_numbers += `,${floor.number}`;
          } else {
            const travelTime =
              type === "elevator" ? 30 : type === "escalator" ? 45 : 60;
            connections.set(connectionId, {
              connection_id: connectionId,
              type,
              floors: floor.name,
              travel_time_seconds: travelTime,
              floor_numbers: String(floor.number),
            });
          }
        }
      }
    });
  });

  const csvContent = [headers.join(",")];
  Array.from(connections.values()).forEach((conn) => {
    csvContent.push(
      [
        `"${conn.connection_id}"`,
        `"${conn.type}"`,
        `"${conn.floors}"`,
        conn.travel_time_seconds,
        `"${conn.floor_numbers}"`,
      ].join(",")
    );
  });

  return csvContent.join("\n");
};

// Download CSV file utility
export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Download PNG file utility
export const downloadPNG = (dataUrl: string, filename: string): void => {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
};
