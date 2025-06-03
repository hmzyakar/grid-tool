// Canvas utility functions for Grid Painter Pro - FIXED VERSION

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
  // Canvas koordinatlarını dünya koordinatlarına çevir
  const worldX = (canvasX - canvasOffset.x) / zoom;
  const worldY = (canvasY - canvasOffset.y) / zoom;

  // Grid koordinatlarını hesapla
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
  maxWidth: number = 1000, // Artırıldı
  maxHeight: number = 700 // Artırıldı
): { width: number; height: number } => {
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
  return {
    width: img.width * ratio,
    height: img.height * ratio,
  };
};

// FIXED: Grid drawing function with proper zoom handling
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
  ctx.lineWidth = 0.5 / zoom; // Zoom'a göre çizgi kalınlığı ayarla
  ctx.globalAlpha = 0.7;

  // Visible area hesaplama
  const visibleLeft = -canvasOffset.x / zoom;
  const visibleTop = -canvasOffset.y / zoom;
  const visibleRight = visibleLeft + canvasSize.width / zoom;
  const visibleBottom = visibleTop + canvasSize.height / zoom;

  // Grid başlangıç noktalarını hesapla
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

// FIXED: Painted cells drawing with proper zoom handling
export const drawPaintedCells = (
  ctx: CanvasRenderingContext2D,
  paintedCells: Map<string, string>,
  canvasSize: { width: number; height: number },
  gridOffset: { x: number; y: number },
  gridSize: number,
  zoom: number,
  canvasOffset: { x: number; y: number }
): void => {
  // Visible area hesaplama
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

    // Sadece görünür alandaki hücreleri çiz
    if (
      drawX + gridSize >= visibleLeft &&
      drawX <= visibleRight &&
      drawY + gridSize >= visibleTop &&
      drawY <= visibleBottom
    ) {
      ctx.fillStyle = cellColor + "80"; // 50% transparency
      ctx.fillRect(drawX, drawY, gridSize, gridSize);
    }
  });
};

// FIXED: Cell labels drawing with proper zoom handling
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
  canvasOffset: { x: number; y: number }
): void => {
  if (!isVisible) return;

  // Visible area hesaplama
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

    // Sadece görünür alandaki hücreleri çiz
    if (
      drawX + gridSize >= visibleLeft &&
      drawX <= visibleRight &&
      drawY + gridSize >= visibleTop &&
      drawY <= visibleBottom
    ) {
      // Dynamic font size based on grid size and zoom - smaller labels
      const baseFontSize = Math.max(8, Math.min(gridSize * 0.25, 12));
      const fontSize = Math.max(6, baseFontSize / Math.max(zoom * 0.5, 1));

      ctx.font = `bold ${fontSize}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const cellColor = paintedCells.get(cellKey);
      const hasBackground = !!cellColor;

      // Join labels with comma for display
      const labelText = labels.join(", ");

      // Draw background for better visibility
      if (!hasBackground) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(drawX + 2, drawY + 2, gridSize - 4, gridSize - 4);
      }

      // Draw shadow for better contrast
      ctx.fillStyle = hasBackground
        ? getContrastColor(cellColor) === "#ffffff"
          ? "#00000080"
          : "#ffffff80"
        : "#00000080";
      ctx.fillText(
        labelText,
        drawX + gridSize / 2 + 1,
        drawY + gridSize / 2 + 1
      );

      // Draw text
      ctx.fillStyle = hasBackground ? getContrastColor(cellColor) : labelColor;
      ctx.fillText(labelText, drawX + gridSize / 2, drawY + gridSize / 2);

      // Draw indicator for labeled cells
      if (hasBackground) {
        ctx.fillStyle = getContrastColor(cellColor);
        ctx.fillRect(drawX + gridSize - 6, drawY + 2, 4, 4);
      }
    }
  });
};
