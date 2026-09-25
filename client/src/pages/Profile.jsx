import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { updateUserProfile } from '../services/userApi';
import ErrorMessage from '../components/ErrorMessage';
import { User, Mail, Phone, MapPin, Lock, Save, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user, updateUserInContext } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      setSubmitting(true);
      const payload = { name, phone, address };
      if (password) payload.password = password;

      const res = await updateUserProfile(user._id, payload);
      if (res.success && res.data) {
        updateUserInContext(res.data);
        setSuccessMsg('Profile updated successfully!');
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container-lg" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>User Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your personal details and account settings.
        </p>
      </div>

      <ErrorMessage message={error} />
      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleUpdate}>
          
          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ paddingLeft: '2.5rem', opacity: 0.7, cursor: 'not-allowed' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge ${user?.role === 'ADMIN' ? 'badge-confirmed' : 'badge-available'}`}>
                {user?.role} ACCOUNT
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <User size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Phone size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <MapPin size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Change Password (Leave blank to keep unchanged)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="New password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            <Save size={16} /> {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>

        </form>
      </div>

    </div>
  );
};

export default Profile;
