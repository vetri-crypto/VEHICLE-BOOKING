import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '../services/adminApi';
import AdminNav from '../components/AdminNav';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/helpers';
import {
  Users,
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getAdminDashboard();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Aggregating admin dashboard stats..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Admin Sub-Nav Header */}
      <AdminNav
        title="Admin Operations Portal"
        subtitle="System metrics, vehicle fleet management, user records, driver assignments, and booking controls."
      />

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <Link to="/admin/users" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Registered Customers & Users</p>
          </div>
        </Link>

        <Link to="/admin/vehicles" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-secondary)' }}>
            <Car size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats?.totalVehicles || 0}</h3>
            <p>Total Fleet ({stats?.availableVehicles} Available)</p>
          </div>
        </Link>

        <Link to="/admin/bookings" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats?.totalBookings || 0}</h3>
            <p>Total Reservations</p>
          </div>
        </Link>

        <Link to="/admin/reports" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(stats?.totalRevenue || 0)}</h3>
            <p>System Gross Revenue</p>
          </div>
        </Link>
      </div>

      {/* Status Counters Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending Bookings</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b' }}>{stats?.pendingBookings || 0}</p>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confirmed Bookings</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6' }}>{stats?.confirmedBookings || 0}</p>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Rentals</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#8b5cf6' }}>{stats?.activeBookings || 0}</p>
        </div>
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed Rentals</span>
          <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>{stats?.completedBookings || 0}</p>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Recent System Bookings</h3>
          <Link to="/admin/bookings" className="btn btn-secondary btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Type & Driver</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Rental Dates</th>
                <th>Route</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <code style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{b.bookingReference}</code>
                    </td>
                    <td>
                      <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: b.bookingType === 'WITH_DRIVER' ? '#10b981' : 'var(--text-secondary)' }}>
                        {b.bookingType === 'WITH_DRIVER' ? 'WITH DRIVER' : 'WITHOUT DRIVER'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {b.driverId ? `Driver: ${b.driverId.name}` : 'Self Drive'}
                      </span>
                    </td>
                    <td>{b.userId?.name || 'Customer'}</td>
                    <td>
                      {b.vehicleId ? `${b.vehicleId.brand} ${b.vehicleId.model}` : 'N/A'}
                    </td>
                    <td>
                      {formatDate(b.startDate)} — {formatDate(b.endDate)}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {b.pickupLocation} → {b.dropLocation}
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No bookings found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
