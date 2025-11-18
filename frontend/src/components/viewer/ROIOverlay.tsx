/**
 * ROI Overlay Component
 * Renders regions of interest on the WSI viewer
 */

import React, { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';
import { ROI, ROIShape } from '../../types';

interface ROIOverlayProps {
  viewer: OpenSeadragon.Viewer;
  slideId: string;
  rois?: ROI[];
  selectedROIId?: string | null;
  onROISelect?: (roi: ROI) => void;
}

export const ROIOverlay: React.FC<ROIOverlayProps> = ({
  viewer,
  slideId,
  rois = [],
  selectedROIId = null,
  onROISelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = viewer.container.clientWidth;
    canvas.height = viewer.container.clientHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.cursor = 'crosshair';

    canvasRef.current = canvas;

    viewer.addOverlay({
      element: canvas,
      location: new OpenSeadragon.Rect(0, 0, 1, 1),
      placement: OpenSeadragon.Placement.TOP_LEFT,
    });

    const drawROIs = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      rois.forEach(roi => {
        const isSelected = roi.id === selectedROIId;

        ctx.strokeStyle = roi.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.setLineDash(isSelected ? [] : [5, 5]);

        if (roi.shape === ROIShape.RECTANGLE && roi.coordinates.length >= 2) {
          const topLeft = viewer.viewport.imageToViewportCoordinates(
            roi.coordinates[0].x,
            roi.coordinates[0].y
          );
          const bottomRight = viewer.viewport.imageToViewportCoordinates(
            roi.coordinates[1].x,
            roi.coordinates[1].y
          );

          const pixelTopLeft = viewer.viewport.viewportToViewerElementCoordinates(topLeft);
          const pixelBottomRight = viewer.viewport.viewportToViewerElementCoordinates(bottomRight);

          const width = pixelBottomRight.x - pixelTopLeft.x;
          const height = pixelBottomRight.y - pixelTopLeft.y;

          ctx.strokeRect(pixelTopLeft.x, pixelTopLeft.y, width, height);

          // Draw label
          ctx.fillStyle = roi.color;
          ctx.font = '14px sans-serif';
          ctx.fillText(roi.name, pixelTopLeft.x, pixelTopLeft.y - 5);
        } else if (roi.coordinates.length > 0) {
          // Draw polygon or freehand
          ctx.beginPath();

          roi.coordinates.forEach((point, index) => {
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

          // Label
          if (roi.coordinates.length > 0) {
            const firstPoint = viewer.viewport.imageToViewportCoordinates(
              roi.coordinates[0].x,
              roi.coordinates[0].y
            );
            const pixelFirst = viewer.viewport.viewportToViewerElementCoordinates(firstPoint);

            ctx.fillStyle = roi.color;
            ctx.font = '14px sans-serif';
            ctx.fillText(roi.name, pixelFirst.x, pixelFirst.y - 5);
          }
        }
      });
    };

    const updateHandler = () => drawROIs();
    viewer.addHandler('animation', updateHandler);
    viewer.addHandler('resize', () => {
      canvas.width = viewer.container.clientWidth;
      canvas.height = viewer.container.clientHeight;
      drawROIs();
    });

    // Handle clicks
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Find clicked ROI
      for (const roi of rois) {
        // Simple hit test - check if point is in bounding box
        const topLeft = viewer.viewport.imageToViewportCoordinates(
          roi.boundingBox.x,
          roi.boundingBox.y
        );
        const bottomRight = viewer.viewport.imageToViewportCoordinates(
          roi.boundingBox.x + roi.boundingBox.width,
          roi.boundingBox.y + roi.boundingBox.height
        );

        const pixelTopLeft = viewer.viewport.viewportToViewerElementCoordinates(topLeft);
        const pixelBottomRight = viewer.viewport.viewportToViewerElementCoordinates(bottomRight);

        if (x >= pixelTopLeft.x && x <= pixelBottomRight.x &&
            y >= pixelTopLeft.y && y <= pixelBottomRight.y) {
          onROISelect?.(roi);
          break;
        }
      }
    };

    canvas.addEventListener('click', handleClick);

    drawROIs();

    return () => {
      viewer.removeHandler('animation', updateHandler);
      canvas.removeEventListener('click', handleClick);
      viewer.removeOverlay(canvas);
    };
  }, [viewer, rois, selectedROIId, onROISelect]);

  return null;
};
