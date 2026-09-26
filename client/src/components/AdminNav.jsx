import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Car, Calendar, BarChart2, UserPlus } from 'lucide-react';

const AdminNav = ({ title, subtitle, showCreateButton = true }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: 'User Management', icon: Users },
    { path: '/admin/vehicles', label: 'Fleet Management', icon: Car },
    { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { path: '/admin/reports', label: 'Reports', icon: BarChart2 }
  ];

  const handleCreateAccountClick = () => {
    navigate('/admin/users?action=create');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1rem' }}>
      
      {/* Top Header Title & Global Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>{title || 'Admin Operations Portal'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {subtitle || 'Manage users, fleet vehicles, driver assignments, and platform settings.'}
          </p>
        </div>

        {showCreateButton && (
          <button
            onClick={handleCreateAccountClick}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <UserPlus size={18} /> + Create User / Driver / Admin
          </button>
        )}
      </div>

      {/* Admin Navigation Sub-Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'var(--bg-card)',
          padding: '0.4rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          overflowX: 'auto'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} /> {item.label}
            </Link>
          );
        })}
      </div>

    </div>
  );
};

export default AdminNav;
