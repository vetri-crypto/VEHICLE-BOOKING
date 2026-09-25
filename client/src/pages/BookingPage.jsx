import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getVehicleById } from '../services/vehicleApi';
import { createBooking } from '../services/bookingApi';
import { getAvailableDrivers } from '../services/userApi';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import PaymentGatewayModal from '../components/PaymentGatewayModal';
import { formatCurrency, formatDate, calculateDays } from '../utils/helpers';
import {
  Car,
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  UserCheck
} from 'lucide-react';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  const initialStartDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
  const initialEndDate = searchParams.get('endDate') || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [pickupLocation, setPickupLocation] = useState('Central Airport Terminal');
  const [dropLocation, setDropLocation] = useState('Downtown Station');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');

  // Booking Type & Driver selection
  const [bookingType, setBookingType] = useState('WITHOUT_DRIVER');
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // Modal States
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!vehicleId) {
      navigate('/vehicles');
      return;
    }

    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const res = await getVehicleById(vehicleId);
        if (res.success && res.data) {
          setVehicle(res.data);
        }
      } catch (err) {
        setError(err.message || 'Vehicle unavailable');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [vehicleId, navigate]);

  // Fetch available drivers when WITH_DRIVER is selected
  useEffect(() => {
    if (bookingType === 'WITH_DRIVER') {
      const fetchDrivers = async () => {
        try {
          setLoadingDrivers(true);
          const res = await getAvailableDrivers();
          if (res.success && res.data) {
            setAvailableDrivers(res.data);
            if (res.data.length > 0) {
              setSelectedDriverId(res.data[0]._id);
            }
          }
        } catch (err) {
          console.error('Failed to fetch drivers:', err);
        } finally {
          setLoadingDrivers(false);
        }
      };
      fetchDrivers();
    }
  }, [bookingType]);

  const numberOfDays = calculateDays(startDate, endDate);
  const vehicleAmount = vehicle ? numberOfDays * vehicle.pricePerDay : 0;
  const driverFee = bookingType === 'WITH_DRIVER' ? numberOfDays * 500 : 0;
  const totalAmount = vehicleAmount + driverFee;

  const handleInitiateBooking = (e) => {
    e.preventDefault();
    setError('');

    if (!pickupLocation || !dropLocation) {
      setError('Please specify both pickup and drop-off locations.');
      return;
    }

    if (numberOfDays <= 0) {
      setError('Invalid date range. End date must be after start date.');
      return;
    }

    if (bookingType === 'WITH_DRIVER' && !selectedDriverId) {
      setError('Please select an available driver.');
      return;
    }

    // If Cash, submit directly without OTP Gateway
    if (paymentMethod === 'CASH') {
      executeCreateBooking({ paymentStatus: 'PENDING', paymentMethod: 'CASH' });
    } else {
      // Open OTP Payment Gateway Modal for online payments
      setIsPaymentGatewayOpen(true);
    }
  };

  const executeCreateBooking = async (paymentData) => {
    try {
      setSubmitting(true);
      const res = await createBooking({
        vehicleId,
        startDate,
        endDate,
        pickupLocation,
        dropLocation,
        paymentMethod: paymentData.paymentMethod || paymentMethod,
        bookingType,
        driverId: bookingType === 'WITH_DRIVER' ? selectedDriverId : null,
        transactionReference: paymentData.transactionReference
      });

      if (res.success && res.data) {
        setIsPaymentGatewayOpen(false);
        setCreatedBooking(res.data);
        setShowSuccessModal(true);
      }
    } catch (err) {
      setError(err.message || 'Booking creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Preparing booking details..." />;
  if (error && !vehicle) return <ErrorMessage message={error} />;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Complete Your Vehicle Reservation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Select booking type, dates, driver preferences, and verify payment with 2FA OTP.
        </p>
      </div>

      <ErrorMessage message={error} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Booking Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Reservation Details
          </h3>

          <form onSubmit={handleInitiateBooking}>
            
            {/* BOOKING TYPE SELECTOR */}
            <div className="form-group">
              <label className="form-label">Booking Option</label>
              <div className="role-selector-grid">
                <label
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${bookingType === 'WITHOUT_DRIVER' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    background: bookingType === 'WITHOUT_DRIVER' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <input
                    type="radio"
                    name="bookingType"
                    value="WITHOUT_DRIVER"
                    checked={bookingType === 'WITHOUT_DRIVER'}
                    onChange={() => setBookingType('WITHOUT_DRIVER')}
                  />
                  <Car size={18} style={{ color: 'var(--accent-primary)' }} /> Without Driver (Self Drive)
                </label>

                <label
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${bookingType === 'WITH_DRIVER' ? '#10b981' : 'var(--border-color)'}`,
                    background: bookingType === 'WITH_DRIVER' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <input
                    type="radio"
                    name="bookingType"
                    value="WITH_DRIVER"
                    checked={bookingType === 'WITH_DRIVER'}
                    onChange={() => setBookingType('WITH_DRIVER')}
                  />
                  <UserCheck size={18} style={{ color: '#10b981' }} /> With Driver (+₹500/day)
                </label>
              </div>
            </div>

            {/* DRIVER SELECTION IF WITH_DRIVER */}
            {bookingType === 'WITH_DRIVER' && (
              <div className="form-group" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UserCheck size={16} style={{ color: '#10b981' }} /> Select Available Driver
                </label>
                {loadingDrivers ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fetching available drivers...</p>
                ) : availableDrivers.length > 0 ? (
                  <select
                    className="form-select"
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    required
                  >
                    {availableDrivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} — Rating: ★ {d.rating || 5.0} (Phone: {d.phone})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#ef4444' }}>
                    No drivers currently available. You can switch to "Without Driver" or try again later.
                  </p>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Pickup Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Drop-off Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Pickup & Drop Location */}
            <div className="form-group">
              <label className="form-label">Pickup Location</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Airport Terminal 1, City Office"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <MapPin size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Drop Location</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Downtown Hotel, Railway Station"
                  value={dropLocation}
                  onChange={(e) => setDropLocation(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <MapPin size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-secondary)' }} />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="CREDIT_CARD">Credit Card / Debit Card (OTP Verification)</option>
                <option value="UPI">UPI — Google Pay / PhonePe / Paytm (OTP Verification)</option>
                <option value="NET_BANKING">Net Banking (OTP Verification)</option>
                <option value="CASH">Pay at Pickup (Cash)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={submitting || numberOfDays <= 0 || (bookingType === 'WITH_DRIVER' && !selectedDriverId)}
            >
              {submitting ? 'Processing...' : paymentMethod === 'CASH' ? 'Confirm Booking (Pay Cash)' : `Proceed to Payment & OTP Verification (${formatCurrency(totalAmount)})`}
            </button>

          </form>
        </div>

        {/* Right Column: Vehicle & Price Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Vehicle Summary
            </h3>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              <img
                src={vehicle.imageUrl}
                alt={`${vehicle.brand} ${vehicle.model}`}
                style={{ width: '90px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
              />
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {vehicle.brand} {vehicle.model}
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {vehicle.category} • {vehicle.fuelType}
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>
                  Reg: {vehicle.vehicleNumber}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Vehicle Daily Rate:</span>
                <span>{formatCurrency(vehicle.pricePerDay)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Rental Duration:</span>
                <span>{numberOfDays} Days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Vehicle Subtotal:</span>
                <span>{formatCurrency(vehicleAmount)}</span>
              </div>
              
              {bookingType === 'WITH_DRIVER' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#10b981', fontWeight: '600' }}>
                  <span>Driver Allowance (₹500 × {numberOfDays}d):</span>
                  <span>+{formatCurrency(driverFee)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', color: 'var(--accent-primary)' }}>
                <span>Total Amount:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ONLINE PAYMENT OTP GATEWAY MODAL */}
      <PaymentGatewayModal
        isOpen={isPaymentGatewayOpen}
        onClose={() => setIsPaymentGatewayOpen(false)}
        onPaymentSuccess={executeCreateBooking}
        amount={totalAmount}
        paymentMethod={paymentMethod}
        vehicleInfo={vehicle}
      />

      {/* SUCCESS CONFIRMATION RECEIPT MODAL */}
      <Modal isOpen={showSuccessModal} onClose={() => navigate('/my-bookings')} title="Booking Confirmed!">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '50%', color: '#10b981', marginBottom: '1rem' }}>
            <CheckCircle2 size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Reservation Successful</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Payment verified and booking confirmed in MongoDB database!
          </p>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '0.9rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Booking Reference:</span>
              <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-heading)' }}>{createdBooking?.bookingReference}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Booking Option:</span>
              <strong style={{ color: bookingType === 'WITH_DRIVER' ? '#10b981' : 'var(--text-primary)' }}>
                {bookingType === 'WITH_DRIVER' ? 'WITH DRIVER' : 'WITHOUT DRIVER (Self Drive)'}
              </strong>
            </div>
            {createdBooking?.driverId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Driver:</span>
                <span>{createdBooking.driverId.name} ({createdBooking.driverId.phone})</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Paid:</span>
              <strong style={{ color: '#10b981' }}>{formatCurrency(createdBooking?.totalAmount)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/my-bookings" className="btn btn-primary" style={{ width: '100%' }}>
              View My Bookings <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default BookingPage;
