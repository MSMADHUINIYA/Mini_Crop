import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiBars3, HiXMark } from 'react-icons/hi2';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/farms', label: 'Farms' },
    { to: '/recommendation', label: 'Crop Advice' },
    { to: '/irrigation', label: 'Irrigation' },
    { to: '/resources', label: 'Resources' },
    { to: '/action-plans', label: 'Tasks' },
  ];

  return (
    <>
      <nav className="navbar">
        <Link to={isAuthenticated ? "/dashboard" : "/login"} className="navbar-brand">
          <div className="navbar-logo">🌾</div>
          <div className="navbar-title">Agri<span>Smart</span></div>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-desktop-links flex items-center gap-6" style={{ display: 'flex' }}>
          {isAuthenticated && (
            <div className="flex items-center gap-6" style={{ display: 'flex' }}>
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    color: isActive(link.to) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: 600
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="navbar-user" ref={dropdownRef} onClick={toggleDropdown}>
                <div className="navbar-user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="navbar-user-info">
                  <span className="navbar-user-name">{user?.name || 'Farmer'}</span>
                  <span className="navbar-user-role">{user?.role || 'FARMER'}</span>
                </div>
                {dropdownOpen && (
                  <div className="navbar-dropdown">
                    <button className="navbar-dropdown-item danger" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>

              <button
                className="navbar-mobile-toggle"
                onClick={toggleMobileMenu}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <HiXMark size={24} /> : <HiBars3 size={24} />}
              </button>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile navigation drawer */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="navbar-mobile-link"
              style={{
                color: isActive(link.to) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: isActive(link.to) ? 'var(--bg-card-hover)' : 'transparent'
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button
            className="navbar-dropdown-item danger"
            style={{ marginTop: 'var(--space-2)' }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}

      {/* Spacer to push content below fixed navbar */}
      <div style={{ height: 'var(--navbar-height)' }}></div>
    </>
  );
}

export default Navbar;
