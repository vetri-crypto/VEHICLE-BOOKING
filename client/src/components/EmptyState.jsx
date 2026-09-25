import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No Data Found', message = 'There are no records matching your request.', actionButton = null }) => {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        <Inbox size={40} />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>{message}</p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
