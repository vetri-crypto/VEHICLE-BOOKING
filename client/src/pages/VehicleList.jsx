import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getVehicles } from '../services/vehicleApi';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import VehicleGrid from '../components/VehicleGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { SlidersHorizontal } from 'lucide-react';

const VehicleList = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    fuelType: '',
    transmission: '',
    maxPrice: ''
  });
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFleet = async () => {
    setLoading(true);
    setError('');
    try {
      const query = {
        search,
        ...filters,
        sortBy,
        sortOrder
      };
      const res = await getVehicles(query);
      if (res.success && res.data) {
        setVehicles(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, [search, filters, sortBy, sortOrder]);

  const resetFilters = () => {
    setSearch('');
    setFilters({
      category: '',
      type: '',
      fuelType: '',
      transmission: '',
      maxPrice: ''
    });
    setSortBy('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Browse Vehicle Fleet</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Explore our available cars, SUVs, luxury sedans, and bikes with live date-availability check.
        </p>
      </div>

      {/* Search & Sort Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <SearchBar search={search} setSearch={setSearch} onSearch={fetchFleet} />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <FilterPanel filters={filters} setFilters={setFilters} resetFilters={resetFilters} />
        </div>
      </div>

      {/* Sort Options Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{vehicles.length}</strong> vehicles
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Sort By:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by || '');
              setSortOrder(order || 'asc');
            }}
          >
            <option value="-">Default (Newest)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="brand-asc">Brand (A-Z)</option>
          </select>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Fleet Display */}
      {loading ? (
        <LoadingSpinner message="Searching vehicles database..." />
      ) : (
        <VehicleGrid vehicles={vehicles} loading={loading} />
      )}

    </div>
  );
};

export default VehicleList;
