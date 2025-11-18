/**
 * Slide Viewer Page
 */

import React from 'react';
import { useParams } from 'react-router-dom';

export const SlideViewerPage: React.FC = () => {
  const { slideId } = useParams<{ slideId: string }>();

  return (
    <div style={{ padding: '24px' }}>
      <h1>Slide Viewer</h1>
      <p>Slide ID: {slideId}</p>
    </div>
  );
};
