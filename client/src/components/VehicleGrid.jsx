import React from 'react';
import VehicleCard from './VehicleCard';
import EmptyState from './EmptyState';

const VehicleGrid = ({ vehicles, loading }) => {
  if (loading) {
    return null; // Handled outside or with loading spinner
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <EmptyState
        title="No Vehicles Available"
        message="We couldn't find any vehicles matching your search criteria. Try adjusting your filters."
      />
    );
  }

  return (
    <div className="vehicle-grid">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle._id} vehicle={vehicle} />
      ))}
    </div>
  );
};

export default VehicleGrid;
