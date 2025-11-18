/**
 * WSI Viewer Component
 * High-resolution whole-slide image viewer using OpenSeadragon
 */

import React, { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { VIEWER_CONFIG } from '../../constants/config';
import { Slide } from '../../types';
import { DetectionOverlay } from './DetectionOverlay';
import { ROIOverlay } from './ROIOverlay';
import './WSIViewer.css';

interface WSIViewerProps {
  slide: Slide;
  onViewportChange?: (viewport: OpenSeadragon.Viewport) => void;
  showDetections?: boolean;
  showROIs?: boolean;
  className?: string;
}

export const WSIViewer: React.FC<WSIViewerProps> = ({
  slide,
  onViewportChange,
  showDetections = true,
  showROIs = true,
  className = '',
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const osdViewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!viewerRef.current || !slide.metadata) return;

    // Initialize OpenSeadragon viewer
    const viewer = OpenSeadragon({
      element: viewerRef.current,
      prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/',

      // Tile source configuration
      tileSources: {
        height: slide.metadata.height,
        width: slide.metadata.width,
        tileSize: slide.metadata.tileSize || VIEWER_CONFIG.TILE_SIZE,
        minLevel: VIEWER_CONFIG.MIN_ZOOM_LEVEL,
        maxLevel: slide.metadata.levels - 1,
        getTileUrl: (level: number, x: number, y: number) => {
          return `${slide.tilesUrl}/${level}/${x}_${y}.jpg`;
        },
      },

      // Viewer configuration
      animationTime: VIEWER_CONFIG.ANIMATION_TIME,
      springStiffness: VIEWER_CONFIG.SPRING_STIFFNESS,
      defaultZoomLevel: VIEWER_CONFIG.DEFAULT_ZOOM,
      minZoomLevel: VIEWER_CONFIG.MIN_ZOOM_LEVEL,
      maxZoomLevel: slide.metadata.levels - 1,
      visibilityRatio: 1.0,
      constrainDuringPan: true,
      showNavigationControl: true,
      showNavigator: true,
      navigatorPosition: 'BOTTOM_RIGHT',

      // Performance settings
      immediateRender: VIEWER_CONFIG.IMMEDIATE_RENDER,
      imageLoaderLimit: 4,
      timeout: 30000,

      // Interaction settings
      gestureSettingsMouse: {
        clickToZoom: false,
        dblClickToZoom: true,
        scrollToZoom: true,
        pinchToZoom: true,
      },
    });

    // Event handlers
    viewer.addHandler('viewport-change', () => {
      if (onViewportChange) {
        onViewportChange(viewer.viewport);
      }
    });

    viewer.addHandler('open', () => {
      setIsReady(true);
    });

    viewer.addHandler('tile-loaded', (event: any) => {
      // Track tile loading performance
      if (event.tiledImage && event.tile) {
        const loadTime = Date.now() - event.tile.loadingTime;
        if (loadTime > VIEWER_CONFIG.MAX_TILE_LOAD_TIME) {
          console.warn(`Tile load time exceeded: ${loadTime}ms`);
        }
      }
    });

    osdViewerRef.current = viewer;

    // Cleanup
    return () => {
      viewer.destroy();
      osdViewerRef.current = null;
      setIsReady(false);
    };
  }, [slide, onViewportChange]);

  return (
    <div className={`wsi-viewer-container ${className}`}>
      <div ref={viewerRef} className="wsi-viewer" />

      {isReady && osdViewerRef.current && (
        <>
          {showDetections && (
            <DetectionOverlay
              viewer={osdViewerRef.current}
              slideId={slide.id}
            />
          )}

          {showROIs && (
            <ROIOverlay
              viewer={osdViewerRef.current}
              slideId={slide.id}
            />
          )}
        </>
      )}

      <div className="viewer-info">
        <div className="slide-info">
          <span className="slide-name">{slide.name}</span>
          {slide.metadata && (
            <span className="slide-meta">
              {slide.metadata.width} × {slide.metadata.height} px
              {' | '}
              {slide.metadata.magnification}×
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
