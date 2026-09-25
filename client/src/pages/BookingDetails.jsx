import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBookingById, cancelBooking } from '../services/bookingApi';
import { createReview } from '../services/reviewApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate, formatCurrency } from '../utils/helpers';
import {
  Calendar,
  MapPin,
  Car,
  CreditCard,
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  UserCheck,
  User
} from 'lucide-react';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Cancel dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getBookingById(id);
      if (res.success && res.data) {
        setBooking(res.data);
        setPayment(res.payment);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      const res = await cancelBooking(id);
      if (res.success) {
        setShowCancelDialog(false);
        fetchDetails();
      }
    } catch (err) {
      alert(err.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!comment) {
      setReviewError('Please enter a comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await createReview({
        vehicleId: booking.vehicleId._id,
        bookingId: booking._id,
        rating,
        comment
      });

      if (res.success) {
        setShowReviewModal(false);
        alert('Thank you! Your review has been submitted successfully.');
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading reservation details..." />;
  if (error || !booking) return <ErrorMessage message={error || 'Booking not found'} />;

  const vehicle = booking.vehicleId || {};
  const driver = booking.driverId;
  const isWithDriver = booking.bookingType === 'WITH_DRIVER';
  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status);
  const canReview = ['COMPLETED', 'CONFIRMED', 'ACTIVE'].includes(booking.status);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reservation Reference</span>
          <h1 style={{ fontSize: '2rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-heading)' }}>
            {booking.bookingReference}
          </h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Booked on {new Date(booking.createdAt).toLocaleString()}
          </span>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <ErrorMessage message={error} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Vehicle Info Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Vehicle Details
          </h3>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              style={{ width: '100px', height: '75px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
            />
            <div>
              <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                {vehicle.brand} {vehicle.model}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Registration: <strong style={{ color: 'var(--text-primary)' }}>{vehicle.vehicleNumber}</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Category: {vehicle.category} • {vehicle.fuelType}
              </p>
            </div>
          </div>

          {/* Booking Option & Driver details */}
          <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Booking Option</span>
            <strong style={{ color: isWithDriver ? '#10b981' : 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
              {isWithDriver ? 'WITH DRIVER' : 'WITHOUT DRIVER (Self Drive)'}
            </strong>
            {isWithDriver && driver && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                <span>Driver Name: <strong style={{ color: 'var(--text-primary)' }}>{driver.name}</strong></span>
                <span style={{ display: 'block' }}>Contact Phone: <strong>{driver.phone}</strong></span>
                <span style={{ display: 'block', color: '#f59e0b' }}>Driver Rating: ★ {driver.rating || 5.0}</span>
              </div>
            )}
          </div>

          <Link to={`/vehicles/${vehicle._id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            <Car size={14} /> View Vehicle Specs
          </Link>
        </div>

        {/* Schedule & Location Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Schedule & Route
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={16} style={{ color: 'var(--accent-secondary)' }} /> Start Date (Pickup)
              </span>
              <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{formatDate(booking.startDate)}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={16} style={{ color: 'var(--accent-primary)' }} /> End Date (Drop)
              </span>
              <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{formatDate(booking.endDate)}</strong>
            </div>

            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={16} style={{ color: '#10b981' }} /> Pickup Location
              </span>
              <p style={{ color: 'var(--text-primary)' }}>{booking.pickupLocation}</p>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={16} style={{ color: '#ef4444' }} /> Drop Location
              </span>
              <p style={{ color: 'var(--text-primary)' }}>{booking.dropLocation}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Payment Receipt Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={18} style={{ color: 'var(--accent-primary)' }} /> Payment & Transaction Details (INR)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Total Paid</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
              {formatCurrency(booking.totalAmount)}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Payment Status</span>
            <strong style={{ color: payment?.paymentStatus === 'REFUNDED' ? '#ef4444' : '#10b981' }}>
              {payment?.paymentStatus || 'SUCCESS'}
            </strong>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Payment Method</span>
            <strong style={{ color: 'var(--text-primary)' }}>{payment?.paymentMethod || 'CREDIT_CARD'}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Transaction Reference</span>
            <code style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--accent-secondary)' }}>
              {payment?.transactionReference || 'TXN-CONFIRMED'}
            </code>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/my-bookings" className="btn btn-secondary">
          ← Back to My Bookings
        </Link>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {canReview && (
            <button onClick={() => setShowReviewModal(true)} className="btn btn-primary">
              <MessageSquare size={16} /> Submit Review
            </button>
          )}

          {canCancel && (
            <button onClick={() => setShowCancelDialog(true)} className="btn btn-danger">
              <XCircle size={16} /> Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Submit Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Submit Vehicle Review">
        <ErrorMessage message={reviewError} />
        <form onSubmit={handleReviewSubmit}>
          <div className="form-group">
            <label className="form-label">Rating (1 to 5 Stars)</label>
            <div style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer', margin: '0.5rem 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  fill={star <= rating ? '#f59e0b' : 'transparent'}
                  color={star <= rating ? '#f59e0b' : 'var(--text-muted)'}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Review Comment</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Share your experience driving this vehicle..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelBooking}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel this booking?"
        confirmText="Yes, Cancel"
        loading={cancelling}
      />

    </div>
  );
};

export default BookingDetails;
