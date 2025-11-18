/**
 * Inference Console Component
 * Biomarker inference control and monitoring
 */

import React, { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiX, FiRefreshCw } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchModels,
  createInferenceJob,
  cancelInferenceJob,
} from '../../features/inference/inferenceSlice';
import { InferenceStatus, InferenceConfig } from '../../types';
import { wsClient } from '../../services/websocket/client';
import { updateJobProgress, updateJobStatus } from '../../features/inference/inferenceSlice';
import './InferenceConsole.css';

interface InferenceConsoleProps {
  slideId: string;
  onInferenceComplete?: (jobId: string) => void;
}

export const InferenceConsole: React.FC<InferenceConsoleProps> = ({
  slideId,
  onInferenceComplete,
}) => {
  const dispatch = useAppDispatch();

  const models = useAppSelector(state =>
    state.inference.modelsList.map(id => state.inference.models[id])
  );

  const jobs = useAppSelector(state =>
    Object.values(state.inference.jobs).filter(job => job.slideId === slideId)
  );

  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [iouThreshold, setIouThreshold] = useState(0.45);
  const [batchSize, setBatchSize] = useState(16);

  useEffect(() => {
    dispatch(fetchModels());
  }, [dispatch]);

  useEffect(() => {
    // Subscribe to WebSocket updates for active jobs
    const activeJobs = jobs.filter(
      job => job.status === InferenceStatus.RUNNING || job.status === InferenceStatus.QUEUED
    );

    activeJobs.forEach(job => {
      wsClient.subscribeToJob(job.id);
    });

    wsClient.onInferenceProgress((update) => {
      dispatch(updateJobProgress(update));
    });

    wsClient.onInferenceStatusChange((update) => {
      dispatch(updateJobStatus(update));

      if (update.status === InferenceStatus.COMPLETED && onInferenceComplete) {
        onInferenceComplete(update.jobId);
      }
    });

    return () => {
      activeJobs.forEach(job => {
        wsClient.unsubscribeFromJob(job.id);
      });
    };
  }, [jobs, dispatch, onInferenceComplete]);

  const handleStartInference = async () => {
    if (!selectedModelId) return;

    const config: InferenceConfig = {
      modelId: selectedModelId,
      confidenceThreshold,
      iouThreshold,
      batchSize,
    };

    try {
      await dispatch(createInferenceJob({ slideId, config })).unwrap();
    } catch (error) {
      console.error('Failed to start inference:', error);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await dispatch(cancelInferenceJob(jobId)).unwrap();
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  const getStatusColor = (status: InferenceStatus): string => {
    switch (status) {
      case InferenceStatus.QUEUED:
        return '#f39c12';
      case InferenceStatus.RUNNING:
        return '#3498db';
      case InferenceStatus.COMPLETED:
        return '#27ae60';
      case InferenceStatus.FAILED:
        return '#e74c3c';
      case InferenceStatus.CANCELLED:
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="inference-console">
      <div className="console-header">
        <h3>Biomarker Inference</h3>
      </div>

      <div className="inference-config">
        <div className="form-group">
          <label>Model</label>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="form-control"
          >
            <option value="">Select a model...</option>
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} v{model.version} ({model.type})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Confidence Threshold</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="form-control"
            />
            <span className="range-value">{confidenceThreshold.toFixed(2)}</span>
          </div>

          <div className="form-group">
            <label>IoU Threshold</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={iouThreshold}
              onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
              className="form-control"
            />
            <span className="range-value">{iouThreshold.toFixed(2)}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Batch Size</label>
          <input
            type="number"
            min="1"
            max="64"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value))}
            className="form-control"
          />
        </div>

        <button
          className="btn btn-primary btn-start"
          onClick={handleStartInference}
          disabled={!selectedModelId}
        >
          <FiPlay />
          Start Inference
        </button>
      </div>

      <div className="inference-jobs">
        <h4>Pipeline Status</h4>

        {jobs.length === 0 ? (
          <div className="no-jobs">No inference jobs yet</div>
        ) : (
          <div className="jobs-list">
            {jobs.map(job => {
              const model = models.find(m => m.id === job.modelId);

              return (
                <div key={job.id} className="job-item">
                  <div className="job-header">
                    <div className="job-model">
                      {model?.name || 'Unknown Model'}
                    </div>
                    <div
                      className="job-status"
                      style={{ color: getStatusColor(job.status) }}
                    >
                      {job.status}
                    </div>
                  </div>

                  {job.status === InferenceStatus.RUNNING && (
                    <>
                      <div className="job-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="progress-text">
                          {job.progress.toFixed(0)}%
                        </span>
                      </div>

                      <div className="job-stats">
                        <div className="stat">
                          <span className="stat-label">Tiles:</span>
                          <span className="stat-value">
                            {job.tilesProcessed} / {job.totalTiles}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Detections:</span>
                          <span className="stat-value">{job.detectionCount}</span>
                        </div>
                        {job.estimatedTimeRemaining && (
                          <div className="stat">
                            <span className="stat-label">ETA:</span>
                            <span className="stat-value">
                              {formatDuration(job.estimatedTimeRemaining)}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelJob(job.id)}
                      >
                        <FiX />
                        Cancel
                      </button>
                    </>
                  )}

                  {job.status === InferenceStatus.COMPLETED && (
                    <div className="job-result">
                      <div className="stat">
                        <span className="stat-label">Total Detections:</span>
                        <span className="stat-value">{job.detectionCount}</span>
                      </div>
                    </div>
                  )}

                  {job.status === InferenceStatus.FAILED && job.error && (
                    <div className="job-error">{job.error}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
