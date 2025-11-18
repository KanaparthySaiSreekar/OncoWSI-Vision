/**
 * Report Generation Types
 * Slide reports, summaries, and export formats
 */

export enum ReportFormat {
  PDF = 'pdf',
  JSON = 'json',
  HTML = 'html',
}

export interface ReportSection {
  title: string;
  content: string;
  order: number;
}

export interface BiomarkerFrequencyTable {
  className: string;
  count: number;
  percentage: number;
  averageConfidence: number;
}

export interface Report {
  id: string;
  slideId: string;
  slideName: string;
  inferenceJobId: string;
  generatedAt: string;
  modelMetadata: {
    name: string;
    version: string;
    type: string;
  };
  summary: {
    totalDetections: number;
    uniqueClasses: number;
    processingTime: number;
    averageConfidence: number;
  };
  frequencyTable: BiomarkerFrequencyTable[];
  heatmapData?: any;
  rois?: {
    id: string;
    name: string;
    statistics: any;
  }[];
  sections: ReportSection[];
  metadata: {
    patientId?: string;
    caseId?: string;
    scanDate?: string;
    stainType?: string;
    magnification?: number;
  };
  anonymized: boolean;
}

export interface ReportExportOptions {
  format: ReportFormat;
  anonymize: boolean;
  includeSections: string[];
  includeHeatmap: boolean;
  includeROIs: boolean;
  includeThumbnail: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  defaultOptions: Partial<ReportExportOptions>;
}
