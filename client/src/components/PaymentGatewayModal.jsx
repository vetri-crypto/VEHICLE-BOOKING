import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ErrorMessage from './ErrorMessage';
import { formatCurrency } from '../utils/helpers';
import {
  CreditCard,
  Lock,
  Smartphone,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound
} from 'lucide-react';

const PaymentGatewayModal = ({ isOpen, onClose, onPaymentSuccess, amount, paymentMethod, vehicleInfo }) => {
  const [step, setStep] = useState(1); // 1: Gateway Details, 2: OTP Verification, 3: Processing
  const [error, setError] = useState('');

  // Card Details State
  const [cardNumber, setCardNumber] = useState('4532 8912 3456 7890');
  const [cardName, setCardName] = useState('John Doe');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('321');

  // UPI State
  const [upiId, setUpiId] = useState('john.doe@upi');

  // Net Banking State
  const [bank, setBank] = useState('HDFC Bank');

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [processing, setProcessing] = useState(false);

  // Generate OTP when moving to Step 2
  const handleProceedToOtp = (e) => {
    e.preventDefault();
    setError('');

    if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
      if (!cardNumber || !expiry || !cvv || !cardName) {
        setError('Please enter all card details.');
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g. name@upi).');
        return;
      }
    }

    // Generate random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setEnteredOtp('');
    setTimer(60);
    setStep(2);
  };

  // Timer countdown for OTP
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleResendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setTimer(60);
    setEnteredOtp('');
    setError('A new 6-digit OTP has been sent.');
  };

  // Verify OTP and complete payment
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!enteredOtp || enteredOtp.trim() !== generatedOtp) {
      setError(`Invalid OTP code. Please enter the correct 6-digit OTP sent to your phone (${generatedOtp}).`);
      return;
    }

    setProcessing(true);
    setStep(3); // Processing step

    setTimeout(() => {
      onPaymentSuccess({
        paymentStatus: 'SUCCESS',
        transactionReference: `TXN-INR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        paymentMethod
      });
      setProcessing(false);
      setStep(1);
    }, 1500);
  };

  const getPaymentTitle = () => {
    switch (paymentMethod) {
      case 'UPI':
        return 'UPI Instant Payment Gateway';
      case 'NET_BANKING':
        return 'Net Banking Secure Portal';
      case 'CASH':
        return 'Pay at Pickup Confirmation';
      default:
        return 'Credit / Debit Card 3D-Secure Gateway';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getPaymentTitle()}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Payable Amount Header */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total Payable Amount</span>
            <strong style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', fontWeight: '800' }}>
              {formatCurrency(amount)}
            </strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-confirmed">256-BIT ENCRYPTED</span>
          </div>
        </div>

        <ErrorMessage message={error} />

        {/* STEP 1: GATEWAY INPUT DETAILS */}
        {step === 1 && (
          <form onSubmit={handleProceedToOtp}>
            {paymentMethod === 'UPI' ? (
              <div className="form-group">
                <label className="form-label">Virtual Payment Address (UPI ID)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="username@upi / phone@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <Smartphone size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-secondary)' }} />
                </div>
              </div>
            ) : paymentMethod === 'NET_BANKING' ? (
              <div className="form-group">
                <label className="form-label">Select Your Bank</label>
                <select
                  className="form-select"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            ) : (
              // CREDIT / DEBIT CARD
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Card Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="4532 8912 3456 7890"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                    <CreditCard size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Cardholder Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="12/28"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      maxLength={3}
                      className="form-input"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Lock size={16} /> Pay & Generate OTP
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: 2FA OTP VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* DEMO SMS NOTIFICATION BADGE */}
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '0.85rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <KeyRound size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase' }}>📱 Bank SMS Alert Simulation</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
                  Your 6-digit Payment OTP is: <strong style={{ fontSize: '1.1rem', color: '#f59e0b', letterSpacing: '2px' }}>{generatedOtp}</strong>
                </p>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Enter 6-Digit Verification OTP</label>
              <input
                type="text"
                maxLength={6}
                className="form-input"
                placeholder="Enter 6-digit OTP code"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontWeight: '700' }}
                autoFocus
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Resend OTP in: <strong style={{ color: 'var(--text-primary)' }}>{timer}s</strong></span>
              <button
                type="button"
                onClick={handleResendOtp}
                className="btn btn-secondary btn-sm"
                disabled={timer > 0}
                style={{ fontSize: '0.75rem' }}
              >
                <RefreshCw size={12} /> Resend OTP
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                Back
              </button>
              <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <ShieldCheck size={18} /> Verify OTP & Pay {formatCurrency(amount)}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PROCESSING SPINNER */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <RefreshCw size={40} className="animate-spin" style={{ color: '#10b981', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Verifying Payment & Creating Booking...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Communicating with Bank & MongoDB Database...
            </p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

      </div>
    </Modal>
  );
};

export default PaymentGatewayModal;
