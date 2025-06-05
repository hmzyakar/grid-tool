// Constants for Indoor Navigation Grid Tool

export interface Color {
  name: string;
  value: string;
  category?: string;
  defaultLabel?: string;
}

// Navigation-specific colors - Only essential navigation types
export const NAVIGATION_COLORS: Color[] = [
  { name: "Walkway", value: "#16a34a", category: "walkway", defaultLabel: "" },
  { name: "POI", value: "#dc2626", category: "poi", defaultLabel: "" },
  {
    name: "Elevator",
    value: "#2563eb",
    category: "elevator",
    defaultLabel: "",
  },
  { name: "Stairs", value: "#ea580c", category: "stairs", defaultLabel: "" },
  {
    name: "Escalator",
    value: "#7c3aed",
    category: "escalator",
    defaultLabel: "",
  },
];

// POI Categories for airport/mall navigation
export const POI_CATEGORIES = [
  "Araç Kiralama",
  "Ayakkabı & Çanta",
  "Bagaj Alım",
  "Banka Şube & ATM",
  "Check-in",
  "Danışma",
  "Duty Free",
  "Döviz",
  "Gümrük",
  "Güvenlik",
  "Havayolu & Bilet Satış",
  "Hizmetler",
  "Kapı",
  "Kayıp Eşya",
  "Kitap, Kırtasiye & Hobi",
  "Lounge",
  "Mağaza",
  "Moda & Giyim",
  "Otel",
  "Otopark",
  "Pasaport Kontrol",
  "Sağlık",
  "Sağlık & Kozmetik",
  "Sigara İçme Alanı",
  "Spor Giyim",
  "Tasarım & Aksesuar",
  "Tuvalet",
  "Ulaşım",
  "WiFi",
  "Yiyecek & İçecek",
  "Yiyecek & İçecek Otomatı",
  "Yük & Bagaj",
  "Çıkış",
  "Çocuk & Oyuncak",
  "Ödeme Noktası",
  "İbadethane",
  "İGA Yanımda",
  "Şarj İstasyonu",
];

// Connection types
export const CONNECTION_TYPES = [
  { type: "elevator", label: "Elevator", color: "#2563eb" },
  { type: "stairs", label: "Stairs", color: "#ea580c" },
  { type: "escalator", label: "Escalator", color: "#7c3aed" },
];

// Floor interface
export interface FloorData {
  name: string;
  number: number;
  paintedCells: Map<string, string>;
  cellLabels: Map<string, string[]>;
  colorPresets: Map<string, string[]>;
  poiCategories: Map<string, string>; // cellKey -> category
}

export const DEFAULT_GRID_SIZE = 20;
export const MIN_GRID_SIZE = 1;
export const MAX_GRID_SIZE = 500;

export const DEFAULT_ZOOM = 1;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10;
export const ZOOM_STEP = 0.1;

// Updated canvas size for better layout
export const DEFAULT_CANVAS_SIZE = {
  width: 900,
  height: 600,
};

export const MAX_LABEL_LENGTH = 100;

// 8-directional movement support
export const DIRECTIONS = [
  { name: "kuzey", dr: -1, dc: 0 },
  { name: "kuzeydoğu", dr: -1, dc: 1 },
  { name: "doğu", dr: 0, dc: 1 },
  { name: "güneydoğu", dr: 1, dc: 1 },
  { name: "güney", dr: 1, dc: 0 },
  { name: "güneybatı", dr: 1, dc: -1 },
  { name: "batı", dr: 0, dc: -1 },
  { name: "kuzeybatı", dr: -1, dc: -1 },
];

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
  noData: "No data yet - create a floor and paint some cells!",
  noFloors: "No floors created yet - create your first floor to start",
  uploadPrompt: "Upload an image to start",
  supportedFormats: "PNG, JPG or GIF formats supported",
  copyInstructions: "Click in the box → Ctrl+A → Ctrl+C to copy all data",
  downloadInstructions: 'Right click on the image below → "Save image as"',
  labelPlaceholder: "Enter label (leave empty to delete)",
  floorPlaceholder: "Enter floor name",
  connectionIdPlaceholder: "Enter connection ID (e.g., ELV_001)",
  poiInstructions: "For POI cells: Enter name and select category",
  connectionInstructions: "For connections: Enter unique ID",
  smartPathfinding:
    "Smart pathfinding: 4-way movement preferred, diagonal as fallback",
} as const;

// Export types
export interface NavigationGridRow {
  row: number;
  col: number;
  floor_name: string;
  floor_number: number;
  walkable: boolean;
  connection_type: string;
  connection_id: string;
}

export interface POIRow {
  poi_id: string;
  name: string;
  display_name: string;
  row: number;
  col: number;
  floor_name: string;
  floor_number: number;
  category: string;
}

export interface VerticalConnectionRow {
  connection_id: string;
  type: string;
  floors: string;
  travel_time_seconds: number;
  floor_numbers: string;
}
