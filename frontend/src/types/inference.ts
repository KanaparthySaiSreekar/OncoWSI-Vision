/**
 * Inference Pipeline Types
 * Model inference, pipeline status, and configuration
 */

export enum InferenceStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ModelType {
  YOLOV5 = 'yolov5',
  DETR = 'detr',
  CUSTOM = 'custom',
}

export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  type: ModelType;
  description: string;
  classSchema: BiomarkerClass[];
  defaultConfidence: number;
  inputSize: number[];
  createdAt: string;
  updatedAt: string;
}

export interface BiomarkerClass {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface InferenceConfig {
  modelId: string;
  confidenceThreshold: number;
  iouThreshold?: number;
  batchSize?: number;
  tileOverlap?: number;
  enablePostProcessing?: boolean;
}

export interface InferenceJob {
  id: string;
  slideId: string;
  modelId: string;
  status: InferenceStatus;
  config: InferenceConfig;
  progress: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  tilesProcessed: number;
  totalTiles: number;
  detectionCount: number;
  estimatedTimeRemaining?: number;
}

export interface InferenceBatch {
  id: string;
  name: string;
  slideIds: string[];
  modelId: string;
  status: InferenceStatus;
  config: InferenceConfig;
  jobs: InferenceJob[];
  createdAt: string;
}
