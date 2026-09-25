import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ search, setSearch, onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', position: 'relative' }}>
      <input
        type="text"
        className="form-input"
        placeholder="Search by brand, model, or type (e.g. Tesla, SUV, BMW)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ paddingLeft: '2.75rem', height: '48px', fontSize: '1rem' }}
      />
      <Search
        size={20}
        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
      />
    </form>
  );
};

export default SearchBar;
