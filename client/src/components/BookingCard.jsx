import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, ArrowRight, XCircle, UserCheck, User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate, formatCurrency } from '../utils/helpers';

const BookingCard = ({ booking, onCancel }) => {
  const vehicle = booking.vehicleId || {};
  const driver = booking.driverId;
  const isWithDriver = booking.bookingType === 'WITH_DRIVER';
  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Top Bar: Reference & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Ref #</span>
          <span style={{ fontWeight: '700', color: 'var(--accent-primary)', fontSize: '1.05rem', fontFamily: 'var(--font-heading)' }}>
            {booking.bookingReference}
          </span>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Vehicle Info & Image */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <img
          src={vehicle.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'}
          alt={`${vehicle.brand} ${vehicle.model}`}
          style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
        />
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>
            {vehicle.brand} {vehicle.model}
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Reg: {vehicle.vehicleNumber} • {vehicle.category}
          </span>
        </div>
      </div>

      {/* Booking Option & Driver Info */}
      <div style={{ padding: '0.5rem 0.75rem', background: isWithDriver ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)' }}>Booking Option:</span>
        <strong style={{ color: isWithDriver ? '#10b981' : 'var(--text-primary)' }}>
          {isWithDriver ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: driver?.name ? '#10b981' : '#f59e0b' }}>
              <UserCheck size={14} /> {driver?.name ? `Driver: ${driver.name} (📞 ${driver.phone})` : '🚕 Driver Dispatch Pending'}
            </span>
          ) : (
            'Self Drive / No Driver'
          )}
        </strong>
      </div>

      {/* Dates and Locations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={14} style={{ color: 'var(--accent-secondary)' }} /> Period
          </span>
          <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginTop: '0.1rem' }}>
            {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
          </p>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={14} style={{ color: 'var(--accent-primary)' }} /> Pickup / Drop
          </span>
          <p style={{ color: 'var(--text-primary)', fontWeight: '500', marginTop: '0.1rem' }}>
            {booking.pickupLocation} → {booking.dropLocation}
          </p>
        </div>
      </div>

      {/* Bottom Bar: Amount in INR & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</span>
          <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {formatCurrency(booking.totalAmount)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(booking._id)}
              className="btn btn-danger btn-sm"
            >
              <XCircle size={14} /> Cancel
            </button>
          )}
          <Link to={`/my-bookings/${booking._id}`} className="btn btn-secondary btn-sm">
            Details <ArrowRight size={14} />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default BookingCard;
