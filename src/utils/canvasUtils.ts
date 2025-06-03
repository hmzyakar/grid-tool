// Canvas utility functions for Grid Painter Pro

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
  const rawCol = Math.floor((worldX - gridOffset.x) / gridSize);
  const rawRow = Math.floor((worldY - gridOffset.y) / gridSize);
  const topLeftCol = Math.floor((0 - gridOffset.x) / gridSize);
  const topLeftRow = Math.floor((0 - gridOffset.y) / gridSize);
  return { col: rawCol - topLeftCol, row: rawRow - topLeftRow };
};

export const gridToCanvasCoords = (
  row: number,
  col: number,
  gridOffset: { x: number; y: number },
  gridSize: number
): { x: number; y: number } => {
  const topLeftCol = Math.floor((0 - gridOffset.x) / gridSize);
  const topLeftRow = Math.floor((0 - gridOffset.y) / gridSize);
  const realCol = col + topLeftCol;
  const realRow = row + topLeftRow;
  return {
    x: realCol * gridSize + gridOffset.x,
    y: realRow * gridSize + gridOffset.y,
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
  maxWidth: number = 800,
  maxHeight: number = 600
): { width: number; height: number } => {
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
  return {
    width: img.width * ratio,
    height: img.height * ratio,
  };
};

export const drawCanvasGrid = (
  ctx: CanvasRenderingContext2D,
  canvasSize: { width: number; height: number },
  gridOffset: { x: number; y: number },
  gridSize: number,
  isVisible: boolean
): void => {
  if (!isVisible) return;

  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.7;

  const startX = gridOffset.x % gridSize;
  const startY = gridOffset.y % gridSize;
  const verticalLines = Math.ceil(canvasSize.width / gridSize) + 2;
  const horizontalLines = Math.ceil(canvasSize.height / gridSize) + 2;

  // Draw vertical lines
  for (let i = 0; i < verticalLines; i++) {
    const x = startX + i * gridSize;
    if (x >= -1 && x <= canvasSize.width + 1) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
  }

  // Draw horizontal lines
  for (let i = 0; i < horizontalLines; i++) {
    const y = startY + i * gridSize;
    if (y >= -1 && y <= canvasSize.height + 1) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
};

export const drawPaintedCells = (
  ctx: CanvasRenderingContext2D,
  paintedCells: Map<string, string>,
  canvasSize: { width: number; height: number },
  gridOffset: { x: number; y: number },
  gridSize: number
): void => {
  paintedCells.forEach((cellColor, cellKey) => {
    const { row, col } = keyToCoords(cellKey);
    const { x: drawX, y: drawY } = gridToCanvasCoords(
      row,
      col,
      gridOffset,
      gridSize
    );

    ctx.fillStyle = cellColor + "80"; // 50% transparency
    if (
      drawX + gridSize >= 0 &&
      drawX <= canvasSize.width &&
      drawY + gridSize >= 0 &&
      drawY <= canvasSize.height
    ) {
      ctx.fillRect(drawX, drawY, gridSize, gridSize);
    }
  });
};

export const drawCellLabels = (
  ctx: CanvasRenderingContext2D,
  cellLabels: Map<string, string[]>,
  paintedCells: Map<string, string>,
  canvasSize: { width: number; height: number },
  gridOffset: { x: number; y: number },
  gridSize: number,
  isVisible: boolean,
  zoom: number,
  labelColor: string
): void => {
  if (!isVisible) return;

  cellLabels.forEach((labels, cellKey) => {
    const { row, col } = keyToCoords(cellKey);
    const { x: drawX, y: drawY } = gridToCanvasCoords(
      row,
      col,
      gridOffset,
      gridSize
    );

    if (
      drawX + gridSize >= 0 &&
      drawX <= canvasSize.width &&
      drawY + gridSize >= 0 &&
      drawY <= canvasSize.height
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
