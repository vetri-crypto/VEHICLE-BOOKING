import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, User, LogOut, Sun, Moon, Calendar, LayoutDashboard, UserCheck, Menu, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const isDriver = user?.role === 'DRIVER';

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close mobile nav menu on page navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar-sticky glass-panel">
      <div className="navbar-container">
        
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <div style={{ padding: '0.4rem', background: 'var(--accent-gradient)', borderRadius: 'var(--radius-md)', display: 'flex', color: '#fff' }}>
            <Car size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-heading)', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              DrivePulse
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Online Vehicle Booking
            </span>
          </div>
        </Link>

        {/* Mobile Actions Header (Theme toggle + Hamburger) */}
        <div className="mobile-actions">
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-full)' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} style={{ color: '#f59e0b' }} /> : <Moon size={18} style={{ color: 'var(--accent-primary)' }} />}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-secondary btn-sm mobile-hamburger-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Desktop & Mobile Collapsible Nav Menu */}
        <div className={`navbar-links ${mobileOpen ? 'mobile-active' : ''}`}>
          <Link
            to="/"
            style={{
              color: isActive('/') ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: isActive('/') ? '700' : '500',
              fontSize: '0.95rem'
            }}
          >
            Home
          </Link>
          
          <Link
            to="/vehicles"
            style={{
              color: isActive('/vehicles') ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: isActive('/vehicles') ? '700' : '500',
              fontSize: '0.95rem'
            }}
          >
            Browse Vehicles
          </Link>

          {isAuthenticated && !isAdmin && !isDriver && (
            <Link
              to="/my-bookings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: isActive('/my-bookings') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive('/my-bookings') ? '700' : '500',
                fontSize: '0.95rem'
              }}
            >
              <Calendar size={16} /> My Bookings
            </Link>
          )}

          {isAuthenticated && isDriver && (
            <Link
              to="/driver/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: location.pathname.startsWith('/driver') ? '#10b981' : 'var(--text-secondary)',
                fontWeight: location.pathname.startsWith('/driver') ? '700' : '500',
                fontSize: '0.95rem',
                padding: '0.25rem 0.65rem',
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <UserCheck size={16} /> Driver Portal
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <Link
              to="/admin/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: location.pathname.startsWith('/admin') ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                fontWeight: location.pathname.startsWith('/admin') ? '700' : '500',
                fontSize: '0.95rem',
                padding: '0.25rem 0.65rem',
                background: 'rgba(6, 182, 212, 0.15)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(6, 182, 212, 0.3)'
              }}
            >
              <LayoutDashboard size={16} /> Admin Portal
            </Link>
          )}

          {/* Mobile Auth & Account Section */}
          <div className="mobile-nav-auth-section">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 0.8rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                >
                  <User size={18} style={{ color: 'var(--accent-primary)' }} />
                  <span>My Profile ({user?.name})</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Desktop Theme Toggle & Auth Buttons */}
          <div className="desktop-auth-section">
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-full)' }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={18} style={{ color: '#f59e0b' }} /> : <Moon size={18} style={{ color: 'var(--accent-primary)' }} />}
            </button>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.8rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <User size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span>{user?.name?.split(' ')[0]}</span>
                  {isAdmin && <span className="badge badge-confirmed" style={{ fontSize: '0.65rem' }}>ADMIN</span>}
                  {isDriver && <span className="badge badge-available" style={{ fontSize: '0.65rem' }}>DRIVER</span>}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Logout"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
