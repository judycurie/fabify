import { TagDimensions } from './tag';

export type BoxStyle = 'open_tray' | 'divided_grid' | 'scoop_caddy' | 'stackable_bin';

export interface BoxConfig {
  // Dimensions in Millimeters
  width: number;             // X: 40mm to 300mm (default 120)
  depth: number;             // Y: 40mm to 250mm (default 80)
  height: number;            // Z: 15mm to 150mm (default 45)
  wallThickness: number;     // 1.2mm to 6.0mm (default 2.4)
  floorThickness: number;    // 1.2mm to 8.0mm (default 2.4)
  filletRadius: number;      // Corner fillet: 0mm to 20mm (default 4.0)
  edgeBevel: number;         // Top edge chamfer: 0mm to 3.0mm (default 0.6)

  // Internal Compartments / Grid Dividers
  gridColumns: number;       // 1 to 6 columns along X (default 2)
  gridRows: number;          // 1 to 5 rows along Y (default 2)
  dividerThickness: number;  // 1.0mm to 4.0mm (default 1.8)
  dividerHeightPercent: number; // 50% to 100% of internal box height (default 100)
  hasScoop: boolean;         // Curved bottom scoop in compartments for easy pickup
  scoopRadius: number;       // Radius of scoop: 2mm to 15mm

  // Stacking & Modular Features
  hasStackingLip: boolean;   // Stepped top lip & bottom inset for secure vertical stacking
  stackingLipHeight: number; // 2mm to 6mm (default 3.0)

  // Custom Front Label
  hasLabel: boolean;
  labelText: string;
  labelFontSize: number;     // 4mm to 16mm (default 8)
  labelStyle: 'embossed' | 'debossed';
  labelRelief: number;       // 0.6mm to 2.0mm (default 1.0)

  // Colors & Viewport
  primaryColor: string;
  accentColor: string;
  showDimensions3D: boolean;
  showBuildPlate: boolean;
}

export interface BoxDimensions {
  totalLength: number;       // X mm
  totalWidth: number;        // Y mm
  totalHeight: number;       // Z mm
  wallThickness: number;     // mm
  floorThickness: number;    // mm
  compartmentWidth: number;  // internal compartment X mm
  compartmentDepth: number;  // internal compartment Y mm
  compartmentHeight: number; // internal compartment Z mm
  compartmentCount: number;  // total pockets (columns * rows)
  volumeCm3: number;
  weightGramsPLA: number;    // PLA ~1.24 g/cm3
  estimatedPrintMinutes: number;
  estimatedLayers: number;   // at 0.2mm layer height
  isWatertight: boolean;
  vertexCount: number;
  triangleCount: number;
}

export interface BoxPreset {
  id: string;
  name: string;
  description: string;
  image?: string;
  category: 'desk' | 'hardware' | 'stationery' | 'gridfinity' | 'tech';
  isFree: boolean;
  digitalPrice: number;      // e.g. 0 for free, 3.99 for paid
  popular?: boolean;
  config: Partial<BoxConfig>;
}
