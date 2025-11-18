/**
 * Report Generator Component
 * Generate and export pathology reports
 */

import React, { useState } from 'react';
import { FiDownload, FiFileText, FiSettings } from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Report, ReportFormat, ReportExportOptions } from '../../types';
import './ReportGenerator.css';

interface ReportGeneratorProps {
  slideId: string;
  jobId: string;
  report?: Report;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  slideId,
  jobId,
  report,
}) => {
  const [exportFormat, setExportFormat] = useState<ReportFormat>(ReportFormat.PDF);
  const [anonymize, setAnonymize] = useState(false);
  const [includeHeatmap, setIncludeHeatmap] = useState(true);
  const [includeROIs, setIncludeROIs] = useState(true);
  const [generating, setGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    if (!report) return;

    setGenerating(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yOffset = 20;

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OncoWSI Vision - Pathology Report', pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 15;

      // Slide information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');

      if (!anonymize) {
        pdf.text(`Slide: ${report.slideName}`, 20, yOffset);
        yOffset += 7;

        if (report.metadata.patientId) {
          pdf.text(`Patient ID: ${report.metadata.patientId}`, 20, yOffset);
          yOffset += 7;
        }

        if (report.metadata.caseId) {
          pdf.text(`Case ID: ${report.metadata.caseId}`, 20, yOffset);
          yOffset += 7;
        }
      }

      pdf.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, 20, yOffset);
      yOffset += 10;

      // Model information
      pdf.setFont('helvetica', 'bold');
      pdf.text('Model Information', 20, yOffset);
      yOffset += 7;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Model: ${report.modelMetadata.name} v${report.modelMetadata.version}`, 20, yOffset);
      yOffset += 7;
      pdf.text(`Type: ${report.modelMetadata.type}`, 20, yOffset);
      yOffset += 10;

      // Summary
      pdf.setFont('helvetica', 'bold');
      pdf.text('Summary', 20, yOffset);
      yOffset += 7;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Detections: ${report.summary.totalDetections}`, 20, yOffset);
      yOffset += 7;
      pdf.text(`Unique Classes: ${report.summary.uniqueClasses}`, 20, yOffset);
      yOffset += 7;
      pdf.text(`Average Confidence: ${(report.summary.averageConfidence * 100).toFixed(1)}%`, 20, yOffset);
      yOffset += 10;

      // Frequency table
      pdf.setFont('helvetica', 'bold');
      pdf.text('Biomarker Frequency', 20, yOffset);
      yOffset += 7;

      // Table headers
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Biomarker', 20, yOffset);
      pdf.text('Count', 80, yOffset);
      pdf.text('Percentage', 120, yOffset);
      pdf.text('Avg. Confidence', 160, yOffset);
      yOffset += 5;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      report.frequencyTable.forEach((row) => {
        if (yOffset > pageHeight - 20) {
          pdf.addPage();
          yOffset = 20;
        }

        pdf.text(row.className, 20, yOffset);
        pdf.text(row.count.toString(), 80, yOffset);
        pdf.text(`${row.percentage.toFixed(1)}%`, 120, yOffset);
        pdf.text(`${(row.averageConfidence * 100).toFixed(1)}%`, 160, yOffset);
        yOffset += 6;
      });

      // Save PDF
      pdf.save(`report_${report.slideId}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateJSON = () => {
    if (!report) return;

    const exportData = anonymize ? {
      ...report,
      slideName: '[REDACTED]',
      metadata: {
        ...report.metadata,
        patientId: undefined,
        caseId: undefined,
      },
    } : report;

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${report.slideId}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (exportFormat === ReportFormat.PDF) {
      handleGeneratePDF();
    } else if (exportFormat === ReportFormat.JSON) {
      handleGenerateJSON();
    }
  };

  if (!report) {
    return (
      <div className="report-generator">
        <div className="no-report">
          <FiFileText />
          <p>No report data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-generator">
      <div className="report-header">
        <h3>Report Generation</h3>
      </div>

      <div className="report-preview">
        <div className="preview-section">
          <h4>Slide Information</h4>
          <div className="info-grid">
            {!anonymize && (
              <>
                <div className="info-item">
                  <span className="label">Slide:</span>
                  <span className="value">{report.slideName}</span>
                </div>
                {report.metadata.patientId && (
                  <div className="info-item">
                    <span className="label">Patient ID:</span>
                    <span className="value">{report.metadata.patientId}</span>
                  </div>
                )}
                {report.metadata.caseId && (
                  <div className="info-item">
                    <span className="label">Case ID:</span>
                    <span className="value">{report.metadata.caseId}</span>
                  </div>
                )}
              </>
            )}
            <div className="info-item">
              <span className="label">Generated:</span>
              <span className="value">{new Date(report.generatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h4>Summary</h4>
          <div className="summary-stats">
            <div className="stat-card">
              <div className="stat-value">{report.summary.totalDetections}</div>
              <div className="stat-label">Total Detections</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{report.summary.uniqueClasses}</div>
              <div className="stat-label">Unique Classes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {(report.summary.averageConfidence * 100).toFixed(1)}%
              </div>
              <div className="stat-label">Avg. Confidence</div>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h4>Biomarker Frequency</h4>
          <table className="frequency-table">
            <thead>
              <tr>
                <th>Biomarker</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Avg. Confidence</th>
              </tr>
            </thead>
            <tbody>
              {report.frequencyTable.map((row, index) => (
                <tr key={index}>
                  <td>{row.className}</td>
                  <td>{row.count}</td>
                  <td>{row.percentage.toFixed(1)}%</td>
                  <td>{(row.averageConfidence * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="export-options">
        <h4>Export Options</h4>

        <div className="option-group">
          <label>Format</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                checked={exportFormat === ReportFormat.PDF}
                onChange={() => setExportFormat(ReportFormat.PDF)}
              />
              PDF
            </label>
            <label className="radio-label">
              <input
                type="radio"
                checked={exportFormat === ReportFormat.JSON}
                onChange={() => setExportFormat(ReportFormat.JSON)}
              />
              JSON
            </label>
          </div>
        </div>

        <div className="option-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={anonymize}
              onChange={(e) => setAnonymize(e.target.checked)}
            />
            Anonymize (HIPAA compliance)
          </label>
        </div>

        <div className="option-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeHeatmap}
              onChange={(e) => setIncludeHeatmap(e.target.checked)}
            />
            Include Heatmap
          </label>
        </div>

        <div className="option-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeROIs}
              onChange={(e) => setIncludeROIs(e.target.checked)}
            />
            Include ROI Analysis
          </label>
        </div>

        <button
          className="btn btn-primary btn-export"
          onClick={handleExport}
          disabled={generating}
        >
          <FiDownload />
          {generating ? 'Generating...' : `Export ${exportFormat.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
};
