import React, { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking as apiCancelBooking } from '../services/bookingApi';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { Link } from 'react-router-dom';
import { Car, Calendar } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Cancel dialog state
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancelDialog = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsCancelOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return;
    try {
      setCancelling(true);
      const res = await apiCancelBooking(selectedBookingId);
      if (res.success) {
        setIsCancelOpen(false);
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'ALL') return true;
    return b.status === activeFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>My Bookings History</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          View, manage, track, and cancel your vehicle reservations.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        {['ALL', 'CONFIRMED', 'ACTIVE', 'PENDING', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className="btn btn-sm"
            style={{
              background: activeFilter === tab ? 'var(--accent-primary)' : 'transparent',
              color: activeFilter === tab ? '#fff' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner message="Fetching your bookings..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No Bookings Found"
          message={activeFilter === 'ALL' ? "You haven't made any vehicle reservations yet." : `No bookings found with status '${activeFilter}'.`}
          actionButton={
            <Link to="/vehicles" className="btn btn-primary btn-sm">
              <Car size={16} /> Browse Vehicles
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {filteredBookings.map((b) => (
            <BookingCard key={b._id} booking={b} onCancel={handleOpenCancelDialog} />
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Vehicle Booking?"
        message="Are you sure you want to cancel this booking? Refund status will be updated to REFUNDED."
        confirmText="Yes, Cancel Booking"
        loading={cancelling}
      />

    </div>
  );
};

export default MyBookings;
