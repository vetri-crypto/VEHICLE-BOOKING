import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getVehicleById, checkAvailability } from '../services/vehicleApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, calculateDays } from '../utils/helpers';
import {
  Fuel,
  Users,
  Gauge,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Star,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date availability checker state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const res = await getVehicleById(id);
        if (res.success && res.data) {
          setVehicle(res.data);
        }
      } catch (err) {
        setError(err.message || 'Vehicle not found');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  const handleCheckAvailability = async (e) => {
    if (e) e.preventDefault();
    if (!startDate || !endDate) return;

    if (new Date(startDate) >= new Date(endDate)) {
      setAvailabilityResult({
        available: false,
        message: 'End date must be after start date'
      });
      return;
    }

    try {
      setCheckingAvailability(true);
      const res = await checkAvailability(id, startDate, endDate);
      if (res.success && res.data) {
        setAvailabilityResult(res.data);
      }
    } catch (err) {
      setAvailabilityResult({
        available: false,
        message: err.message || 'Failed to check availability'
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (vehicle && startDate && endDate) {
      handleCheckAvailability();
    }
  }, [vehicle, startDate, endDate]);

  const handleProceedBooking = () => {
    navigate(`/booking?vehicleId=${id}&startDate=${startDate}&endDate=${endDate}`);
  };

  if (loading) return <LoadingSpinner message="Loading vehicle specifications..." />;
  if (error || !vehicle) return <ErrorMessage message={error || 'Vehicle unavailable'} />;

  const daysCount = calculateDays(startDate, endDate);
  const estimatedPrice = daysCount * vehicle.pricePerDay;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Top Banner & Title */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>
              {vehicle.brand} • {vehicle.category}
            </span>
            <StatusBadge status={vehicle.status} />
          </div>
          <h1 style={{ fontSize: '2.25rem' }}>
            {vehicle.brand} {vehicle.model}
          </h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Registration No: <strong style={{ color: 'var(--text-primary)' }}>{vehicle.vehicleNumber}</strong>
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Daily Rate</span>
          <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--accent-primary)', lineHeight: '1' }}>
            {formatCurrency(vehicle.pricePerDay)}
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}> / day</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Specs & Image, Right Availability Checker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Image & Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: 0, overflow: 'hidden', height: '340px' }}>
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>

          {/* Vehicle Specifications */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Key Specifications
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--accent-secondary)' }}>
                  <Fuel size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Fuel Type</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{vehicle.fuelType}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
                  <Gauge size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Transmission</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{vehicle.transmission}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', color: '#f59e0b' }}>
                  <Users size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Seating Capacity</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{vehicle.seatingCapacity} Passengers</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', color: '#10b981' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Type / Class</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{vehicle.type}</strong>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Description</h4>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {vehicle.description || 'No additional description provided.'}
              </p>
            </div>

          </div>

        </div>

        {/* Right Column: Date Selection & Booking Price Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} style={{ color: 'var(--accent-primary)' }} /> Select Rental Dates
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Select start & end dates to calculate exact rental price and check real-time availability.
            </p>

            <form onSubmit={handleCheckAvailability}>
              <div className="form-group">
                <label className="form-label">Pickup Date (Start)</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  min={todayStr}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Drop-off Date (End)</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  min={startDate || todayStr}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </form>

            {/* Price Estimate Summary */}
            <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Rental Duration:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{daysCount} Days</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Rate ({formatCurrency(vehicle.pricePerDay)} × {daysCount} days):</span>
                <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(estimatedPrice)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)', fontWeight: '700' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--accent-primary)' }}>{formatCurrency(estimatedPrice)}</span>
              </div>
            </div>

            {/* Availability Alert Result */}
            {checkingAvailability ? (
              <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Verifying date range availability with server...
              </div>
            ) : availabilityResult ? (
              availabilityResult.available ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="alert alert-success" style={{ margin: 0 }}>
                    <CheckCircle2 size={18} />
                    <span>Vehicle is <strong>AVAILABLE</strong> for selected dates!</span>
                  </div>
                  <button
                    onClick={handleProceedBooking}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                  >
                    Proceed to Booking <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
                <div className="alert alert-error" style={{ margin: 0 }}>
                  <AlertTriangle size={18} />
                  <span>{availabilityResult.reason || availabilityResult.message || 'Vehicle is NOT available for the selected dates.'}</span>
                </div>
              )
            ) : null}

          </div>

          {/* Guarantee Info */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(6, 182, 212, 0.08)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
            <Info size={24} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              <strong>Zero Hidden Charges:</strong> All prices include basic insurance, maintenance, and double-booking protection guarantee.
            </p>
          </div>

        </div>

      </div>

      {/* Customer Reviews Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Customer Reviews</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {vehicle.totalReviews > 0 ? `Average Rating: ${vehicle.avgRating} / 5 (${vehicle.totalReviews} reviews)` : 'No reviews yet for this vehicle.'}
            </span>
          </div>
          {vehicle.avgRating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b', fontSize: '1.2rem', fontWeight: '700' }}>
              <Star size={20} fill="#f59e0b" /> {vehicle.avgRating}
            </div>
          )}
        </div>

        {vehicle.reviews && vehicle.reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {vehicle.reviews.map((rev) => (
              <div key={rev._id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{rev.userId?.name || 'Customer'}</span>
                  <div style={{ display: 'flex', gap: '0.2rem', color: '#f59e0b' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" />
                    ))}
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>"{rev.comment}"</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                  Submitted on {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            Completed bookings can be reviewed by customers in their booking details page.
          </p>
        )}
      </div>

    </div>
  );
};

export default VehicleDetails;
