/**
 * Main Layout Component
 * Primary application layout with navigation
 */

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiUpload, FiActivity, FiFileText, FiFolderOpen, FiUser, FiLogOut } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../features/auth/authSlice';
import { ROUTES } from '../../constants/routes';
import './MainLayout.css';

export const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(state => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const navItems = [
    { icon: FiHome, label: 'Home', path: ROUTES.HOME },
    { icon: FiUpload, label: 'Upload', path: ROUTES.SLIDE_UPLOAD },
    { icon: FiActivity, label: 'Inference', path: ROUTES.INFERENCE },
    { icon: FiFileText, label: 'Reports', path: ROUTES.REPORTS },
    { icon: FiFolderOpen, label: 'Workspaces', path: ROUTES.WORKSPACES },
  ];

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>OncoWSI</h1>
          <span className="version">v1.0.0</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className="nav-item"
              onClick={() => navigate(item.path)}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <div className="user-avatar">
                <FiUser />
              </div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
          )}

          <button className="logout-button" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
