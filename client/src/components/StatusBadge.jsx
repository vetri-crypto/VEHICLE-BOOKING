import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = status.toUpperCase();

  const getBadgeClass = () => {
    switch (s) {
      case 'AVAILABLE':
        return 'badge-available';
      case 'BOOKED':
        return 'badge-booked';
      case 'PENDING':
        return 'badge-pending';
      case 'CONFIRMED':
        return 'badge-confirmed';
      case 'ACTIVE':
        return 'badge-active';
      case 'COMPLETED':
        return 'badge-completed';
      case 'CANCELLED':
        return 'badge-cancelled';
      case 'MAINTENANCE':
        return 'badge-pending';
      default:
        return 'badge-cancelled';
    }
  };

  return <span className={`badge ${getBadgeClass()}`}>{status}</span>;
};

export default StatusBadge;
