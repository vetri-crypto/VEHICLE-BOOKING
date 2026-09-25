import React from 'react';
import { Link } from 'react-router-dom';
import { Fuel, Users, Gauge, Star, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '../utils/helpers';

const VehicleCard = ({ vehicle }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}>
      
      {/* Vehicle Image */}
      <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <img
          src={vehicle.imageUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <StatusBadge status={vehicle.status} />
        </div>
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(11, 15, 25, 0.8)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--accent-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {vehicle.category}
        </div>
      </div>

      {/* Card Details */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {vehicle.brand}
            </span>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              {vehicle.model}
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
              {formatCurrency(vehicle.pricePerDay)}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>/ day</span>
          </div>
        </div>

        {/* Feature Specs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', margin: '1rem 0', padding: '0.75rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Fuel size={14} style={{ color: 'var(--accent-secondary)' }} />
            <span>{vehicle.fuelType}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Gauge size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{vehicle.transmission}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Users size={14} style={{ color: '#f59e0b' }} />
            <span>{vehicle.seatingCapacity} Seats</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          <Link to={`/vehicles/${vehicle._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
            Details
          </Link>
          <Link to={`/vehicles/${vehicle._id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
            Book Now <ArrowRight size={14} />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default VehicleCard;
