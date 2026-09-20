import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiBars3, HiXMark } from 'react-icons/hi2';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">🌾</div>
          <div className="navbar-title">Agri<span>Smart</span></div>
        </Link>

        {/* Desktop Links */}
        <div className="flex items-center gap-6" style={{ display: 'flex' }}>
          {isAuthenticated && (
            <div className="flex items-center gap-6" style={{ display: 'flex' }}>
              <Link to="/dashboard" style={{ color: isActive('/dashboard') ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>Dashboard</Link>
              <Link to="/farms" style={{ color: isActive('/farms') ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>Farms</Link>
              <Link to="/recommendation" style={{ color: isActive('/recommendation') ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>Crop Advice</Link>
              <Link to="/irrigation" style={{ color: isActive('/irrigation') ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>Irrigation</Link>
              <Link to="/resources" style={{ color: isActive('/resources') ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>Resources</Link>
              <Link to="/action-plans" style={{ color: isActive('/action-plans') ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>Tasks</Link>
            </div>
          )}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="navbar-user" onClick={toggleDropdown}>
              <div className="navbar-user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user?.name}</span>
                <span className="navbar-user-role">{user?.role}</span>
              </div>
              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <button className="navbar-dropdown-item danger" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </nav>
      {/* Spacer to push content below fixed navbar */}
      <div style={{ height: 'var(--navbar-height)' }}></div>
    </>
  );
}

export default Navbar;
