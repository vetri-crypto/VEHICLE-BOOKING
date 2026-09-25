import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Phone, Lock, MapPin, UserCheck, ShieldAlert } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import ErrorMessage from '../components/ErrorMessage';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    role: 'CUSTOMER'
  });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    try {
      setSubmitting(true);
      const user = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        role: formData.role
      });

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'DRIVER') {
        navigate('/driver/dashboard');
      } else {
        navigate('/vehicles');
      }
    } catch (err) {
      setLocalError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container-lg">
      <div className="card" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff' }}>
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join DrivePulse as Customer, Driver, or Administrator</p>
        </div>

        <ErrorMessage message={localError} />

        <form onSubmit={handleSubmit}>
          
          {/* Role Selection Radio Buttons */}
          <div className="form-group">
            <label className="form-label">Account Type (Role)</label>
            <div className="role-selector-grid">
              <label
                style={{
                  flex: 1,
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${formData.role === 'CUSTOMER' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: formData.role === 'CUSTOMER' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-input)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)'
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="CUSTOMER"
                  checked={formData.role === 'CUSTOMER'}
                  onChange={handleChange}
                />
                <User size={16} style={{ color: 'var(--accent-primary)' }} /> Customer
              </label>

              <label
                style={{
                  flex: 1,
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${formData.role === 'DRIVER' ? '#10b981' : 'var(--border-color)'}`,
                  background: formData.role === 'DRIVER' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-input)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)'
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="DRIVER"
                  checked={formData.role === 'DRIVER'}
                  onChange={handleChange}
                />
                <UserCheck size={16} style={{ color: '#10b981' }} /> Driver
              </label>

              <label
                style={{
                  flex: 1,
                  padding: '0.65rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${formData.role === 'ADMIN' ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
                  background: formData.role === 'ADMIN' ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-input)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)'
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={formData.role === 'ADMIN'}
                  onChange={handleChange}
                />
                <ShieldAlert size={16} style={{ color: 'var(--accent-secondary)' }} /> Admin
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <User size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Phone size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="address"
                className="form-input"
                placeholder="123 Main St, City"
                value={formData.address}
                onChange={handleChange}
                style={{ paddingLeft: '2.5rem' }}
              />
              <MapPin size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting}>
            {submitting ? 'Creating Account...' : `Register as ${formData.role}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>
            Sign in here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
