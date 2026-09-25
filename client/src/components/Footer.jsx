import React from 'react';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '1.25rem 1.5rem', marginTop: '4rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span>© 2026 DrivePulse — Online Vehicle Booking System. All rights reserved.</span>
        <span>INR (₹) Currency Supported</span>
      </div>
    </footer>
  );
};

export default Footer;
