import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Phone, Lock, MapPin } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import ErrorMessage from '../components/ErrorMessage';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: ''
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
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address
      });

      navigate('/vehicles');
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join DrivePulse as a Customer</p>
        </div>

        <ErrorMessage message={localError} />

        <form onSubmit={handleSubmit}>
          
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
            {submitting ? 'Creating Account...' : 'Register'}
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
