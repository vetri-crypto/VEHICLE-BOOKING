import React, { useState, useEffect } from 'react';
import { getAdminUsers } from '../services/adminApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Users, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
    fetchUsers();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>User Directory</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Registered customer accounts and system administrator records.
        </p>
      </div>

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
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-confirmed' : 'badge-available'}`}>
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

    </div>
  );
};

export default AdminUsers;
