/**
 * Detection Overlay Component
 * Renders biomarker detections on the WSI viewer
 */

import React, { useEffect, useRef, useCallback } from 'react';
import OpenSeadragon from 'openseadragon';
import { useAppSelector } from '../../hooks/redux';
import { Detection, DetectionShape } from '../../types';
import { VISUALIZATION_CONFIG } from '../../constants/config';

interface DetectionOverlayProps {
  viewer: OpenSeadragon.Viewer;
  slideId: string;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  viewer,
  slideId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<OpenSeadragon.Overlay | null>(null);

  const detections = useAppSelector(state => state.detections.detections[slideId] || []);
  const layers = useAppSelector(state => state.detections.layers[slideId] || []);
  const settings = useAppSelector(state => state.detections.visualizationSettings);

  const drawDetections = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get viewport bounds for culling
    const viewportBounds = viewer.viewport.getBounds();
    const imageSize = viewer.world.getItemAt(0)?.getContentSize();
    if (!imageSize) return;

    // Filter detections by confidence threshold and layer visibility
    const visibleDetections = detections.filter(detection => {
      if (detection.confidence < settings.confidenceThreshold) return false;

      const layer = layers.find(l => l.classId === detection.classId);
      if (!layer || !layer.visible) return false;

      return true;
    });

    // Draw each detection
    visibleDetections.forEach(detection => {
      const layer = layers.find(l => l.classId === detection.classId);
      if (!layer) return;

      const color = settings.colorBlindSafe
        ? VISUALIZATION_CONFIG.COLORBLIND_SAFE_PALETTE[detection.classId % 8]
        : layer.color;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = settings.lineWidth;
      ctx.globalAlpha = layer.opacity;

      if (detection.shape === DetectionShape.BBOX && detection.bbox) {
        // Draw bounding box
        if (settings.showBoundingBoxes) {
          const viewportRect = viewer.viewport.imageToViewportRectangle(
            detection.bbox.x,
            detection.bbox.y,
            detection.bbox.width,
            detection.bbox.height
          );

          const pixelRect = viewer.viewport.viewportToViewerElementRectangle(viewportRect);

          ctx.strokeRect(pixelRect.x, pixelRect.y, pixelRect.width, pixelRect.height);

          // Draw confidence label
          if (settings.showConfidenceLabels) {
            ctx.font = '12px sans-serif';
            ctx.fillStyle = color;
            ctx.globalAlpha = 1.0;
            const label = `${detection.className} ${(detection.confidence * 100).toFixed(0)}%`;
            ctx.fillText(label, pixelRect.x, pixelRect.y - 5);
          }
        }
      } else if (detection.shape === DetectionShape.POLYGON && detection.polygon) {
        // Draw polygon
        if (settings.showPolygons && detection.polygon.points.length > 0) {
          ctx.beginPath();

          detection.polygon.points.forEach((point, index) => {
            const viewportPoint = viewer.viewport.imageToViewportCoordinates(point.x, point.y);
            const pixelPoint = viewer.viewport.viewportToViewerElementCoordinates(viewportPoint);

            if (index === 0) {
              ctx.moveTo(pixelPoint.x, pixelPoint.y);
            } else {
              ctx.lineTo(pixelPoint.x, pixelPoint.y);
            }
          });

          ctx.closePath();
          ctx.stroke();

          // Fill with transparency
          ctx.globalAlpha = layer.opacity * 0.3;
          ctx.fill();
        }
      }
    });

    ctx.globalAlpha = 1.0;
  }, [detections, layers, settings, viewer]);

  useEffect(() => {
    // Create canvas overlay
    const canvas = document.createElement('canvas');
    canvas.width = viewer.container.clientWidth;
    canvas.height = viewer.container.clientHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';

    canvasRef.current = canvas;

    // Add as OpenSeadragon overlay
    const overlay = viewer.addOverlay({
      element: canvas,
      location: new OpenSeadragon.Rect(0, 0, 1, 1),
      placement: OpenSeadragon.Placement.TOP_LEFT,
    });

    overlayRef.current = overlay as any;

    // Redraw on viewport change
    const updateHandler = () => {
      if (canvasRef.current) {
        drawDetections(canvasRef.current);
      }
    };

    viewer.addHandler('animation', updateHandler);
    viewer.addHandler('resize', () => {
      if (canvasRef.current) {
        canvasRef.current.width = viewer.container.clientWidth;
        canvasRef.current.height = viewer.container.clientHeight;
        drawDetections(canvasRef.current);
      }
    });

    // Initial draw
    drawDetections(canvas);

    // Cleanup
    return () => {
      viewer.removeHandler('animation', updateHandler);
      if (overlayRef.current) {
        viewer.removeOverlay(canvas);
      }
    };
  }, [viewer, drawDetections]);

  // Redraw when detections or settings change
  useEffect(() => {
    if (canvasRef.current) {
      drawDetections(canvasRef.current);
    }
  }, [detections, layers, settings, drawDetections]);

  return null;
};
