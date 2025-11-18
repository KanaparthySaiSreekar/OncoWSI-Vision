/**
 * Slide Upload Page
 */

import React from 'react';
import { SlideUploader } from '../components/upload/SlideUploader';

export const SlideUploadPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <SlideUploader />
    </div>
  );
};
