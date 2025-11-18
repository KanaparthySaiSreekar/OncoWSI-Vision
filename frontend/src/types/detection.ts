/**
 * Detection and Annotation Types
 * Biomarker detections, bounding boxes, and visualization
 */

export enum DetectionShape {
  BBOX = 'bbox',
  POLYGON = 'polygon',
  POINT = 'point',
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Polygon {
  points: Point[];
}

export interface Detection {
  id: string;
  slideId: string;
  inferenceJobId: string;
  classId: number;
  className: string;
  confidence: number;
  shape: DetectionShape;
  bbox?: BoundingBox;
  polygon?: Polygon;
  point?: Point;
  tileX: number;
  tileY: number;
  level: number;
  metadata?: Record<string, any>;
}

export interface DetectionLayer {
  classId: number;
  className: string;
  color: string;
  visible: boolean;
  opacity: number;
  count: number;
}

export interface DetectionStatistics {
  slideId: string;
  totalDetections: number;
  byClass: Record<number, number>;
  averageConfidence: number;
  densityPerMm2?: number;
}

export interface VisualizationSettings {
  showBoundingBoxes: boolean;
  showPolygons: boolean;
  showConfidenceLabels: boolean;
  confidenceThreshold: number;
  lineWidth: number;
  opacity: number;
  colorBlindSafe: boolean;
}
