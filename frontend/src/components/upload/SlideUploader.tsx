/**
 * Slide Uploader Component
 * Drag-and-drop file upload with validation
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { uploadSlide } from '../../features/slides/slidesSlice';
import { STORAGE_CONFIG } from '../../constants/config';
import './SlideUploader.css';

interface FileWithPreview extends File {
  preview?: string;
  validationError?: string;
}

export const SlideUploader: React.FC = () => {
  const dispatch = useAppDispatch();
  const uploadProgress = useAppSelector(state => state.slides.uploadProgress);
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > STORAGE_CONFIG.MAX_UPLOAD_SIZE) {
      return `File too large. Max size: ${STORAGE_CONFIG.MAX_UPLOAD_SIZE / (1024 ** 3)}GB`;
    }

    // Check file extension
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!STORAGE_CONFIG.ALLOWED_FORMATS.includes(extension)) {
      return `Invalid format. Allowed: ${STORAGE_CONFIG.ALLOWED_FORMATS.join(', ')}`;
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validatedFiles = acceptedFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.validationError = validateFile(file);
      return fileWithPreview;
    });

    setFiles(prev => [...prev, ...validatedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/tiff': ['.tif', '.tiff'],
      'image/ndpi': ['.ndpi'],
      'image/svs': ['.svs'],
      'application/octet-stream': ['.mrxs'],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const validFiles = files.filter(f => !f.validationError);

    for (const file of validFiles) {
      try {
        await dispatch(uploadSlide(file)).unwrap();
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    // Clear uploaded files
    setFiles(prev => prev.filter(f => f.validationError));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / (1024 ** 2)).toFixed(2)} MB`;
    return `${(bytes / (1024 ** 3)).toFixed(2)} GB`;
  };

  return (
    <div className="slide-uploader">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <FiUpload className="upload-icon" />
        <h3>Drag & Drop WSI Files</h3>
        <p>or click to browse</p>
        <div className="supported-formats">
          <span>Supported: {STORAGE_CONFIG.ALLOWED_FORMATS.join(', ')}</span>
        </div>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h4>Files ({files.length})</h4>

          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className={`file-item ${file.validationError ? 'error' : ''}`}
            >
              <FiFile className="file-icon" />

              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>

                {file.validationError && (
                  <div className="validation-error">
                    <FiAlertCircle />
                    {file.validationError}
                  </div>
                )}
              </div>

              {!file.validationError && uploadProgress[file.name] && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress[file.name].progress}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {uploadProgress[file.name].progress.toFixed(0)}%
                  </span>
                </div>
              )}

              {!file.validationError && !uploadProgress[file.name] && (
                <button
                  className="remove-button"
                  onClick={() => removeFile(index)}
                  aria-label="Remove file"
                >
                  <FiX />
                </button>
              )}

              {uploadProgress[file.name]?.progress === 100 && (
                <FiCheckCircle className="success-icon" />
              )}
            </div>
          ))}

          <div className="upload-actions">
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={files.every(f => f.validationError)}
            >
              Upload {files.filter(f => !f.validationError).length} file(s)
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setFiles([])}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
