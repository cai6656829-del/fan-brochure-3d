export interface DesignMetric {
  label: string;
  value: string;
  sub?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  cmyk?: string;
  pantone?: string;
}

export interface PageData {
  id: string;
  index: number;
  side: "front" | "back";
  panelIndex: number; // 0, 1, 2, 3
  code: string;
  title: string;
  subtitle: string;
  sector?: string;
  accent: string;
  accentBg: string;
  accentText: string;
  summary: string;
  fullDescription: string;
  typography: {
    display: string;
    body: string;
    sample: string;
  };
  metrics?: DesignMetric[];
  colors: ColorSwatch[];
  tags: string[];
  mockupTypes: ("identity" | "packaging" | "signage" | "digital" | "print" | "grid")[];
  customImageUrl?: string; // Optional user-uploaded custom artwork image
  imageUrl?: string; // Static physical fallback image
  specifications: {
    paperStock: string;
    printFinishing: string;
    dimensions: string;
    foldingType: string;
  };
}

export interface CameraOrbit {
  rotX: number; // tilt angle
  rotY: number; // azimuth angle
  zoom: number;
  foldAngle: number; // angle between accordion panels in degrees (e.g. 40 to 120)
  targetPanel: number | null; // which panel is currently focused
}
