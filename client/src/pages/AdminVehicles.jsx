import React, { useState, useEffect } from 'react';
import { getAdminVehicles } from '../services/adminApi';
import { createVehicle, updateVehicle, deleteVehicle } from '../services/vehicleApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency } from '../utils/helpers';
import { Plus, Edit, Trash2, Car, RefreshCw } from 'lucide-react';

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const initialForm = {
    vehicleNumber: '',
    brand: '',
    model: '',
    type: 'Car',
    category: 'Sedan',
    description: '',
    pricePerDay: '',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: '5',
    imageUrl: '',
    status: 'AVAILABLE'
  };
  const [formData, setFormData] = useState(initialForm);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await getAdminVehicles();
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
    fetchVehicles();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditingId(null);
    setFormData(initialForm);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setIsEdit(true);
    setEditingId(v._id);
    setFormData({
      vehicleNumber: v.vehicleNumber,
      brand: v.brand,
      model: v.model,
      type: v.type,
      category: v.category,
      description: v.description || '',
      pricePerDay: v.pricePerDay,
      fuelType: v.fuelType,
      transmission: v.transmission,
      seatingCapacity: v.seatingCapacity,
      imageUrl: v.imageUrl,
      status: v.status
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.vehicleNumber || !formData.brand || !formData.model || !formData.pricePerDay || !formData.imageUrl) {
      setModalError('Please fill all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        pricePerDay: Number(formData.pricePerDay),
        seatingCapacity: Number(formData.seatingCapacity)
      };

      if (isEdit) {
        await updateVehicle(editingId, payload);
      } else {
        await createVehicle(payload);
      }

      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setModalError(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deleteVehicle(deleteId);
      setIsDeleteOpen(false);
      fetchVehicles();
    } catch (err) {
      alert(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Vehicle Fleet Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Add, update, modify pricing, status, and details for all vehicles in the catalog.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Add New Vehicle
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner message="Fetching fleet catalog..." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Reg Number</th>
                  <th>Type & Category</th>
                  <th>Rate / Day</th>
                  <th>Fuel & Trans</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length > 0 ? (
                  vehicles.map((v) => (
                    <tr key={v._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={v.imageUrl}
                            alt={v.model}
                            style={{ width: '50px', height: '38px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                          />
                          <div>
                            <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                              {v.brand} {v.model}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {v.seatingCapacity} Seats
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code style={{ color: 'var(--accent-secondary)' }}>{v.vehicleNumber}</code>
                      </td>
                      <td>
                        {v.type} ({v.category})
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>
                        {formatCurrency(v.pricePerDay)}
                      </td>
                      <td>
                        {v.fuelType} • {v.transmission}
                      </td>
                      <td>
                        <StatusBadge status={v.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleOpenEdit(v)} className="btn btn-secondary btn-sm" title="Edit">
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(v._id);
                              setIsDeleteOpen(true);
                            }}
                            className="btn btn-danger btn-sm"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No vehicles found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? 'Edit Vehicle Details' : 'Add New Vehicle to Fleet'}>
        <ErrorMessage message={modalError} />

        <form onSubmit={handleSubmitForm}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Registration Number</label>
              <input
                type="text"
                name="vehicleNumber"
                className="form-input"
                placeholder="TN01AB1234"
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                type="text"
                name="brand"
                className="form-input"
                placeholder="Tesla, BMW, Audi..."
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                type="text"
                name="model"
                className="form-input"
                placeholder="Model 3, X5, A6..."
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price Per Day ($)</label>
              <input
                type="number"
                name="pricePerDay"
                className="form-input"
                placeholder="120"
                value={formData.pricePerDay}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Vehicle Type</label>
              <select name="type" className="form-select" value={formData.type} onChange={handleChange}>
                <option value="Car">Car</option>
                <option value="SUV">SUV</option>
                <option value="Bike">Bike</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                <option value="Electric">Electric</option>
                <option value="Luxury">Luxury</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Economy">Economy</option>
                <option value="Bike">Bike</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select name="fuelType" className="form-select" value={formData.fuelType} onChange={handleChange}>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transmission</label>
              <select name="transmission" className="form-select" value={formData.transmission} onChange={handleChange}>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Seats</label>
              <input
                type="number"
                name="seatingCapacity"
                className="form-input"
                value={formData.seatingCapacity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="url"
              name="imageUrl"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="BOOKED">BOOKED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              rows={3}
              placeholder="Vehicle highlights and features..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Create Vehicle'}
            </button>
          </div>

        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle from the catalog?"
        confirmText="Delete Vehicle"
        loading={deleting}
      />

    </div>
  );
};

export default AdminVehicles;
