import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const FilterPanel = ({ filters, setFilters, resetFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '1rem' }}>
          <Filter size={18} style={{ color: 'var(--accent-primary)' }} /> Filter Vehicles
        </h4>
        <button
          onClick={resetFilters}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
          type="button"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        
        {/* Category */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Category</label>
          <select name="category" className="form-select" value={filters.category || ''} onChange={handleChange}>
            <option value="">All Categories</option>
            <option value="Electric">Electric</option>
            <option value="Luxury">Luxury</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Economy">Economy</option>
            <option value="Bike">Bike</option>
          </select>
        </div>

        {/* Vehicle Type */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Type</label>
          <select name="type" className="form-select" value={filters.type || ''} onChange={handleChange}>
            <option value="">All Types</option>
            <option value="Car">Car</option>
            <option value="SUV">SUV</option>
            <option value="Bike">Bike</option>
            <option value="Van">Van</option>
          </select>
        </div>

        {/* Fuel Type */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Fuel Type</label>
          <select name="fuelType" className="form-select" value={filters.fuelType || ''} onChange={handleChange}>
            <option value="">All Fuel Types</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Transmission */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Transmission</label>
          <select name="transmission" className="form-select" value={filters.transmission || ''} onChange={handleChange}>
            <option value="">All Transmissions</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        {/* Max Price */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Max Price / Day ($)</label>
          <input
            type="number"
            name="maxPrice"
            className="form-input"
            placeholder="e.g. 150"
            value={filters.maxPrice || ''}
            onChange={handleChange}
          />
        </div>

      </div>
    </div>
  );
};

export default FilterPanel;
