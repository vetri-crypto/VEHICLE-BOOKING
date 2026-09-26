import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAdminUsers, createAdminUser } from '../services/adminApi';
import AdminNav from '../components/AdminNav';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Users, Mail, Phone, MapPin, UserPlus, X, User, UserCheck, ShieldAlert, Lock } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const AdminUsers = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    role: 'DRIVER'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    if (location.search.includes('action=create')) {
      setShowModal(true);
    }
  }, [location.search]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    // Client-side duplicate email check
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === formData.email.trim().toLowerCase()
    );
    if (emailExists) {
      setFormError('An account with this email already exists.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createAdminUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        address: formData.address,
        role: formData.role
      });

      if (res.success) {
        setSuccessMsg(`Account created successfully as ${formData.role}!`);
        setShowModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          address: '',
          role: 'DRIVER'
        });
        await fetchUsers();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return { background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' };
      case 'DRIVER':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'CUSTOMER':
      default:
        return { background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.3)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <AdminNav
        title="User Management & Account Creation"
        subtitle="Manage registered customers, fleet drivers, and system administrators. Create new accounts on demand."
      />

      {successMsg && (
        <div className="alert alert-success" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          ✅ {successMsg}
        </div>
      )}

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner message="Fetching user directory..." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{u.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</span>
                      </td>
                      <td>
                        <span style={{ display: 'block', fontSize: '0.85rem' }}>📞 {u.phone}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {u.address || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="badge" style={getRoleBadgeStyle(u.role)}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'ACTIVE' ? 'badge-available' : 'badge-cancelled'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No registered users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create User</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Create a new account (Customer, Driver, or Admin).
              </p>
            </div>

            <ErrorMessage message={formError} />

            <form onSubmit={handleCreateUserSubmit}>
              {/* Account Type / Role Selection */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Account Type (Role)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('CUSTOMER')}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${formData.role === 'CUSTOMER' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      background: formData.role === 'CUSTOMER' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
                      color: formData.role === 'CUSTOMER' ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <User size={16} /> Customer
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('DRIVER')}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${formData.role === 'DRIVER' ? '#10b981' : 'var(--border-color)'}`,
                      background: formData.role === 'DRIVER' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
                      color: formData.role === 'DRIVER' ? '#10b981' : 'var(--text-primary)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <UserCheck size={16} /> Driver
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('ADMIN')}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${formData.role === 'ADMIN' ? '#06b6d4' : 'var(--border-color)'}`,
                      background: formData.role === 'ADMIN' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                      color: formData.role === 'ADMIN' ? '#06b6d4' : 'var(--text-primary)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <ShieldAlert size={16} /> Admin
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                  <User size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-grid-2">
                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                    <Mail size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                    <Phone size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                {/* Password */}
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      name="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                    <Lock size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-input"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                    <Lock size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="form-label">Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    placeholder="123 Main St, City"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <MapPin size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : `Create ${formData.role}`}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
