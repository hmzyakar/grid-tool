// Constants for Grid Painter Pro

export interface Color {
  name: string;
  value: string;
}

export const DEFAULT_COLORS: Color[] = [
  { name: "Blue", value: "#2563eb" },
  { name: "Emerald", value: "#059669" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Pink", value: "#db2777" },
  { name: "Orange", value: "#ea580c" },
  { name: "Red", value: "#dc2626" },
  { name: "Teal", value: "#0d9488" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Green", value: "#16a34a" },
  { name: "Yellow", value: "#ca8a04" },
  { name: "Slate", value: "#475569" },
  { name: "Black", value: "#1f2937" },
];

export const DEFAULT_GRID_SIZE = 20;
export const MIN_GRID_SIZE = 1;
export const MAX_GRID_SIZE = 500;

export const DEFAULT_ZOOM = 1;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10;
export const ZOOM_STEP = 0.1;

export const DEFAULT_CANVAS_SIZE = {
  width: 800,
  height: 600,
};

export const MAX_LABEL_LENGTH = 100;

export const CANVAS_SETTINGS = {
  pixelRatio: () => window.devicePixelRatio || 1,
  imageSmoothingEnabled: true,
  imageSmoothingQuality: "high" as ImageSmoothingQuality,
};

export const SUPPORTED_IMAGE_FORMATS = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
];

export const UI_MESSAGES = {
  noData: "No data yet - paint a cell!",
  uploadPrompt: "Upload an image to start",
  supportedFormats: "PNG, JPG or GIF formats supported",
  copyInstructions: "Click in the box → Ctrl+A → Ctrl+C to copy all data",
  downloadInstructions: 'Right click on the image below → "Save image as"',
  labelPlaceholder: "Enter label (leave empty to delete)",
} as const;
