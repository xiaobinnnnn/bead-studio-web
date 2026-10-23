export type BeadBrand = 'MARD' | 'HAMA' | 'PERLER' | 'ARTKAL' | (string & {});

export type CellSource = 'conversion' | 'photo-reconstruction' | 'manual';

export type RgbColor = readonly [number, number, number];

export interface BeadCell {
  row: number;
  column: number;
  colorId: string | null;
  confirmed: boolean;
  source: CellSource;
  confidence?: number;
  sampledRgb?: RgbColor;
}

export interface BeadGrid {
  width: number;
  height: number;
  cells: BeadCell[];
}

export interface BeadPaletteColor {
  id: string;
  brand: BeadBrand;
  code: string;
  displayRgb: RgbColor;
  name?: string;
}

export interface BeadPalette {
  id: string;
  brand: BeadBrand;
  version: string;
  calibrated: boolean;
  colors: BeadPaletteColor[];
}

export interface SourceImage {
  name?: string;
  mediaType?: string;
  width: number;
  height: number;
  orientationApplied: boolean;
  embeddedDataUrl?: string;
}

export interface ImageTransform {
  fit: 'contain' | 'cover' | 'stretch';
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
}

export interface ExportProfile {
  id: string;
  name: string;
  width: number;
  height: number;
  pixelScale: number;
  verifiedDeviceCompatibility: boolean;
}

export interface BeadProject {
  schemaVersion: '2.0.0';
  id: string;
  name: string;
  grid: BeadGrid;
  palette: Pick<BeadPalette, 'id' | 'brand' | 'version' | 'calibrated'>;
  sourceImage?: SourceImage;
  imageTransform: ImageTransform;
  exportProfile?: ExportProfile;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_IMAGE_TRANSFORM: ImageTransform = {
  fit: 'contain',
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotation: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
};

