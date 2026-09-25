import React, { useState, useEffect } from 'react';
import { getAdminBookings, updateBookingStatus } from '../services/adminApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Calendar, RefreshCw, CheckCircle, Edit3, UserCheck } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Status Change Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAdminBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenStatusModal = (b) => {
    setSelectedBooking(b);
    setNewStatus(b.status);
    setStatusError('');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setStatusError('');

    if (!newStatus || !selectedBooking) return;

    try {
      setUpdating(true);
      const res = await updateBookingStatus(selectedBooking._id, newStatus);
      if (res.success) {
        setIsModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      setStatusError(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Reservation Management</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Monitor system bookings, assigned drivers, route details, and status transition flow.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['ALL', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className="btn btn-sm"
              style={{
                background: filterStatus === tab ? 'var(--accent-primary)' : 'transparent',
                color: filterStatus === tab ? '#fff' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <button onClick={fetchBookings} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner message="Fetching system reservations..." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Type & Driver</th>
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
                {filtered.length > 0 ? (
                  filtered.map((b) => (
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
                      <td>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{b.userId?.name || 'Customer'}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.userId?.email}</span>
                      </td>
                      <td>
                        {b.vehicleId ? (
                          <>
                            <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{b.vehicleId.brand} {b.vehicleId.model}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reg: {b.vehicleId.vehicleNumber}</span>
                          </>
                        ) : 'N/A'}
                      </td>
                      <td>
                        {formatDate(b.startDate)} — {formatDate(b.endDate)}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem' }}>{b.pickupLocation} → {b.dropLocation}</span>
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                        {formatCurrency(b.totalAmount)}
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleOpenStatusModal(b)} className="btn btn-secondary btn-sm">
                          <Edit3 size={14} /> Change Status
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No bookings found for status '{filterStatus}'.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Booking Status Flow">
        <ErrorMessage message={statusError} />
        
        {selectedBooking && (
          <form onSubmit={handleUpdateStatus}>
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 0.3rem' }}>Booking Ref: <strong style={{ color: 'var(--accent-primary)' }}>{selectedBooking.bookingReference}</strong></p>
              <p style={{ margin: '0 0 0.3rem' }}>Customer: <strong>{selectedBooking.userId?.name}</strong></p>
              <p style={{ margin: '0 0 0.3rem' }}>Type: <strong>{selectedBooking.bookingType}</strong> ({selectedBooking.driverId ? `Driver: ${selectedBooking.driverId.name}` : 'Self Drive'})</p>
              <p style={{ margin: '0' }}>Current Status: <StatusBadge status={selectedBooking.status} /></p>
            </div>

            <div className="form-group">
              <label className="form-label">Select New Status</label>
              <select
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? 'Updating...' : 'Save New Status'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default AdminBookings;
