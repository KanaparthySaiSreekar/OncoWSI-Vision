/**
 * Main App Component
 * Application root with routing
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ROUTES } from './constants/routes';

// Layout
import { MainLayout } from './components/layout/MainLayout';

// Auth
import { LoginForm } from './components/auth/LoginForm';

// Pages (placeholders - to be created)
import { HomePage } from './pages/HomePage';
import { SlideUploadPage } from './pages/SlideUploadPage';
import { SlideViewerPage } from './pages/SlideViewerPage';
import { InferencePage } from './pages/InferencePage';
import { ReportsPage } from './pages/ReportsPage';
import { WorkspacesPage } from './pages/WorkspacesPage';

import './App.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginForm />} />

          <Route element={<MainLayout />}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.SLIDE_UPLOAD} element={<SlideUploadPage />} />
            <Route path={ROUTES.SLIDE_VIEWER} element={<SlideViewerPage />} />
            <Route path={ROUTES.INFERENCE} element={<InferencePage />} />
            <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
            <Route path={ROUTES.WORKSPACES} element={<WorkspacesPage />} />
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
