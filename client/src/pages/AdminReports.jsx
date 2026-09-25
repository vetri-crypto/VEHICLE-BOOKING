import React, { useState, useEffect } from 'react';
import { getAdminReports } from '../services/adminApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency } from '../utils/helpers';
import { BarChart3, PieChart, Award, TrendingUp, ShieldCheck } from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await getAdminReports();
        if (res.success && res.data) {
          setReports(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner message="Generating system reports..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>System Reports & Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Fleet category distribution, booking statistics, and top revenue-generating vehicles.
        </p>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        
        {/* Vehicles by Type Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} style={{ color: 'var(--accent-secondary)' }} /> Fleet Distribution by Type
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports?.vehiclesByType && reports.vehiclesByType.length > 0 ? (
              reports.vehiclesByType.map((item) => (
                <div key={item._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{item._id || 'Other'}</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{item.count} Vehicles</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(item.count * 20, 100)}%`, background: 'var(--accent-gradient)' }} />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No vehicle data available.</p>
            )}
          </div>
        </div>

        {/* Bookings by Status */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} style={{ color: 'var(--accent-primary)' }} /> Bookings by Status
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports?.bookingsByStatus && reports.bookingsByStatus.length > 0 ? (
              reports.bookingsByStatus.map((item) => (
                <div key={item._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{item._id}</span>
                    <span style={{ color: 'var(--accent-secondary)', fontWeight: '700' }}>{item.count} Bookings</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(item.count * 25, 100)}%`, background: 'linear-gradient(90deg, #06b6d4, #10b981)' }} />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No booking stats recorded yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Top Booked Vehicles Leaderboard */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} style={{ color: '#f59e0b' }} /> Top Revenue-Generating Vehicles
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Reg Number</th>
                <th>Category</th>
                <th>Bookings Count</th>
                <th>Total Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              {reports?.topVehicles && reports.topVehicles.length > 0 ? (
                reports.topVehicles.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={item.vehicleDetails?.imageUrl}
                          alt={item.vehicleDetails?.model}
                          style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        />
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {item.vehicleDetails?.brand} {item.vehicleDetails?.model}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <code style={{ color: 'var(--accent-secondary)' }}>{item.vehicleDetails?.vehicleNumber}</code>
                    </td>
                    <td>{item.vehicleDetails?.category}</td>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {item.bookingCount} Times
                    </td>
                    <td style={{ fontWeight: '800', color: '#10b981' }}>
                      {formatCurrency(item.totalRevenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No vehicle leaderboard data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminReports;
