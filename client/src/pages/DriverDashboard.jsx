import React, { useState, useEffect } from 'react';
import {
  getDriverDashboard,
  acceptBooking as apiAcceptBooking,
  startBooking as apiStartBooking,
  completeBooking as apiCompleteBooking,
  updateDriverStatus as apiUpdateDriverStatus
} from '../services/driverApi';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/helpers';
import {
  UserCheck,
  Car,
  Calendar,
  MapPin,
  Phone,
  User,
  Play,
  CheckCircle,
  Star,
  Power,
  Clock,
  RefreshCw
} from 'lucide-react';

const DriverDashboard = () => {
  const { user, updateUserInContext } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDriverDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch driver dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleStatus = async () => {
    if (!data?.driver) return;
    const currentStatus = data.driver.driverStatus;
    if (currentStatus === 'BUSY') {
      alert('You cannot change availability status while handling an active trip.');
      return;
    }

    const nextStatus = currentStatus === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
    try {
      setActionLoading(true);
      const res = await apiUpdateDriverStatus(nextStatus);
      if (res.success && res.data) {
        updateUserInContext(res.data);
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptTrip = async (bookingId) => {
    try {
      setActionLoading(true);
      const res = await apiAcceptBooking(bookingId);
      if (res.success) {
        alert('🎉 Booking accepted successfully! Ride assigned to your schedule.');
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to accept booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTrip = async (bookingId) => {
    try {
      setActionLoading(true);
      const res = await apiStartBooking(bookingId);
      if (res.success) {
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to start trip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTrip = async (bookingId) => {
    try {
      setActionLoading(true);
      const res = await apiCompleteBooking(bookingId);
      if (res.success) {
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to complete trip');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading driver portal..." />;
  if (error) return <ErrorMessage message={error} />;

  const driver = data?.driver || user;
  const bookings = data?.assignedBookings || [];
  const availableRequests = data?.availableRequests || [];

  const activeTrip = bookings.find((b) => b.status === 'ACTIVE');
  const upcomingTrips = bookings.filter((b) => ['CONFIRMED', 'PENDING'].includes(b.status));
  const completedTrips = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Driver Header Profile Card */}
      <div className="card glass-panel page-header" style={{ padding: '1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', flexShrink: 0 }}>
            <UserCheck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.65rem', margin: 0 }}>{driver.name}</h1>
              <span className="badge badge-available">DRIVER</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
              📞 {driver.phone} • Rating: <strong style={{ color: '#f59e0b' }}>★ {driver.rating || 5.0}</strong>
            </p>
          </div>
        </div>

        {/* Availability Status & Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={fetchDashboard} className="btn btn-secondary btn-sm" title="Refresh Dashboard">
            <RefreshCw size={14} /> Refresh
          </button>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Duty Status</span>
            <span className={`badge ${driver.driverStatus === 'AVAILABLE' ? 'badge-available' : driver.driverStatus === 'BUSY' ? 'badge-active' : 'badge-cancelled'}`}>
              ● {driver.driverStatus}
            </span>
          </div>

          {driver.driverStatus !== 'BUSY' && (
            <button
              onClick={handleToggleStatus}
              className={`btn ${driver.driverStatus === 'AVAILABLE' ? 'btn-danger' : 'btn-primary'} btn-sm`}
              disabled={actionLoading}
            >
              <Power size={14} /> {driver.driverStatus === 'AVAILABLE' ? 'Go Offline' : 'Go Available'}
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{availableRequests.length}</h3>
            <p>Available Ride Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{data?.totalTrips || 0}</h3>
            <p>Total Assigned Trips</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Car size={24} />
          </div>
          <div className="stat-info">
            <h3>{data?.activeTrips || 0}</h3>
            <p>Current Active Trip</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{data?.completedTrips || 0}</h3>
            <p>Completed Trips</p>
          </div>
        </div>
      </div>

      {/* 🚀 Available Broadcast Ride Requests (Sent to all drivers) */}
      <div className="card" style={{ border: availableRequests.length > 0 ? '2px solid #3b82f6' : '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>📢 Available Customer Ride Requests</h3>
              <span className="badge badge-pending" style={{ fontSize: '0.8rem' }}>
                Broadcast to All Drivers ({availableRequests.length})
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              Customer bookings awaiting a driver. Accept any request to add it to your assigned rides.
            </p>
          </div>
          <button onClick={fetchDashboard} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh Requests
          </button>
        </div>

        {availableRequests.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Vehicle Requested</th>
                  <th>Dates & Duration</th>
                  <th>Pickup → Drop Route</th>
                  <th>Total Fare</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {availableRequests.map((req) => (
                  <tr key={req._id} style={{ background: 'rgba(59, 130, 246, 0.03)' }}>
                    <td>
                      <code style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{req.bookingReference}</code>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{req.userId?.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📞 {req.userId?.phone}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{req.vehicleId?.brand} {req.vehicleId?.model}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.vehicleId?.vehicleNumber} ({req.vehicleId?.category})</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {formatDate(req.startDate)} — {formatDate(req.endDate)}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '3px', color: '#3b82f6' }} />
                      <strong>{req.pickupLocation}</strong> → <strong>{req.dropLocation}</strong>
                    </td>
                    <td style={{ fontWeight: '700', color: '#10b981', fontSize: '1.05rem' }}>
                      {formatCurrency(req.totalAmount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleAcceptTrip(req._id)}
                        className="btn btn-primary btn-sm"
                        disabled={actionLoading || driver.driverStatus === 'OFFLINE'}
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', whiteSpace: 'nowrap' }}
                      >
                        <CheckCircle size={14} /> Accept Booking
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem 0', margin: 0 }}>
            No new ride requests currently broadcasted. Check back soon!
          </p>
        )}
      </div>

      {/* Active Trip Banner */}
      {activeTrip && (
        <div className="card" style={{ border: '2px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div>
              <span className="badge badge-active" style={{ marginBottom: '0.25rem' }}>⚡ TRIP CURRENTLY IN PROGRESS</span>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Ref #{activeTrip.bookingReference}</h3>
            </div>
            <button
              onClick={() => handleCompleteTrip(activeTrip._id)}
              className="btn btn-primary btn-lg"
              disabled={actionLoading}
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <CheckCircle size={18} /> Complete Booking / Trip
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
              <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{activeTrip.userId?.name} ({activeTrip.userId?.phone})</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span>
              <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{activeTrip.vehicleId?.brand} {activeTrip.vehicleId?.model} ({activeTrip.vehicleId?.vehicleNumber})</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Route:</span>
              <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{activeTrip.pickupLocation} → {activeTrip.dropLocation}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
              <strong style={{ display: 'block', color: '#10b981', fontSize: '1.1rem' }}>{formatCurrency(activeTrip.totalAmount)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Assigned Bookings Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Assigned Bookings ({upcomingTrips.length})
        </h3>

        {upcomingTrips.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Rental Period</th>
                  <th>Route</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingTrips.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <code style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{b.bookingReference}</code>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{b.userId?.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📞 {b.userId?.phone}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{b.vehicleId?.brand} {b.vehicleId?.model}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.vehicleId?.vehicleNumber}</span>
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
                    <td style={{ textAlign: 'right' }}>
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStartTrip(b._id)}
                          className="btn btn-primary btn-sm"
                          disabled={actionLoading || !!activeTrip}
                        >
                          <Play size={14} /> Start Booking
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem 0' }}>
            No pending or upcoming assigned bookings.
          </p>
        )}
      </div>

      {/* Completed Trips History */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Completed Trips ({completedTrips.length})
        </h3>

        {completedTrips.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Rental Period</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedTrips.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <code style={{ color: 'var(--accent-primary)' }}>{b.bookingReference}</code>
                    </td>
                    <td>{b.userId?.name}</td>
                    <td>{b.vehicleId?.brand} {b.vehicleId?.model}</td>
                    <td>{formatDate(b.startDate)} — {formatDate(b.endDate)}</td>
                    <td style={{ fontWeight: '700', color: '#10b981' }}>{formatCurrency(b.totalAmount)}</td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem 0' }}>
            No completed trips recorded yet.
          </p>
        )}
      </div>

    </div>
  );
};

export default DriverDashboard;
