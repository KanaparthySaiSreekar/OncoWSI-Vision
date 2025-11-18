/**
 * Region Analysis Types
 * ROI selection, region statistics, and analysis tools
 */

export enum ROIShape {
  RECTANGLE = 'rectangle',
  POLYGON = 'polygon',
  FREEHAND = 'freehand',
  CIRCLE = 'circle',
}

export interface ROI {
  id: string;
  slideId: string;
  name: string;
  shape: ROIShape;
  coordinates: Point[];
  boundingBox: BoundingBox;
  area: number;
  areaUnit: 'pixels' | 'mm2';
  createdAt: string;
  color: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RegionStatistics {
  roiId: string;
  totalDetections: number;
  detectionsByClass: Record<number, number>;
  density: number;
  averageConfidence: number;
  confidenceDistribution: {
    min: number;
    max: number;
    mean: number;
    median: number;
    stdDev: number;
  };
}

export interface RegionExport {
  roiId: string;
  format: 'png' | 'jpg' | 'tiff';
  resolution: number;
  includeAnnotations: boolean;
}

export interface Heatmap {
  slideId: string;
  classId?: number;
  gridSize: number;
  data: number[][];
  colorScale: string[];
  min: number;
  max: number;
}
