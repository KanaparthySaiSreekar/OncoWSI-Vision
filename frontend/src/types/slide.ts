/**
 * WSI Slide Types
 * Whole-slide image data models and metadata
 */

export enum SlideFormat {
  TIFF = 'tiff',
  PYRAMIDAL_TIFF = 'pyramidal_tiff',
  NDPI = 'ndpi',
  SVS = 'svs',
  MRXS = 'mrxs',
}

export enum SlideStatus {
  UPLOADING = 'uploading',
  VALIDATING = 'validating',
  READY = 'ready',
  PROCESSING = 'processing',
  ERROR = 'error',
}

export interface SlideMetadata {
  width: number;
  height: number;
  magnification: number;
  pixelsPerMicron: number;
  tileSize: number;
  levels: number;
  format: SlideFormat;
  colorSpace?: string;
  compression?: string;
}

export interface Slide {
  id: string;
  name: string;
  format: SlideFormat;
  size: number;
  uploadedAt: string;
  status: SlideStatus;
  metadata?: SlideMetadata;
  thumbnailUrl?: string;
  tilesUrl: string;
  s3Key?: string;
  error?: string;
  patientId?: string;
  caseId?: string;
  scanDate?: string;
  stainType?: string;
}

export interface SlideUploadProgress {
  slideId: string;
  progress: number;
  speed: number;
  remainingTime: number;
}

export interface SlideValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
