import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createFarm, updateFarm, getFarmById } from '../services/api';
import toast from 'react-hot-toast';
import { HiGlobeAlt, HiMapPin, HiScale, HiArrowLeft, HiBeaker, HiSun } from 'react-icons/hi2';

function FarmForm({ editMode = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [soilType, setSoilType] = useState('Loamy');
  const [loading, setLoading] = useState(editMode);

  // Load existing farm data when editing
  useEffect(() => {
    if (editMode && id) {
      const fetchFarm = async () => {
        try {
          const data = await getFarmById(id);
          setName(data.name || '');
          setLocation(data.location || '');
          setArea(data.area?.toString() || '');
          setLatitude(data.latitude?.toString() || '');
          setLongitude(data.longitude?.toString() || '');
          setSoilType(data.soilType || 'Loamy');
        } catch (err) {
          toast.error('Failed to load farm data');
        } finally {
          setLoading(false);
        }
      };
      fetchFarm();
    }
  }, [editMode, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !location || !area) {
      toast.error('Name, location, and area are required');
      return;
    }
    setLoading(true);
    const farmData = { 
      name, 
      location, 
      area: Number(area),
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      soilType
    };
    try {
      if (editMode && id) {
        await updateFarm(id, farmData);
        toast.success('Farm updated successfully');
      } else {
        await createFarm(farmData);
        toast.success('Farm registered successfully');
      }
      navigate('/farms');
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: '560px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link to="/farms" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          <HiArrowLeft size={16} /> Back to Farm List
        </Link>
        <h2 style={{ fontSize: 'var(--font-size-3xl)', fontFamily: "'Outfit', var(--font-family)", marginTop: 'var(--space-2)' }}>
          {editMode ? 'Edit Farm Plot' : 'Register New Farm'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Provide the size, soil composition, and coordinates for precision recommendation and weather monitoring.
        </p>
      </div>

      <div className="card" style={{ padding: 'var(--space-8)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="farm-name">Farm Name</label>
            <div style={{ position: 'relative' }}>
              <HiGlobeAlt size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="farm-name"
                type="text"
                placeholder="e.g. North Orchard"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="farm-location">Location / Region</label>
            <div style={{ position: 'relative' }}>
              <HiMapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="farm-location"
                type="text"
                placeholder="e.g. Punjab, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="farm-area">Area Size (acres)</label>
            <div style={{ position: 'relative' }}>
              <HiScale size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="farm-area"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 5.5"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div>
              <label htmlFor="farm-lat">Latitude (Optional)</label>
              <input
                id="farm-lat"
                type="number"
                step="any"
                placeholder="e.g. 30.73"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="farm-lon">Longitude (Optional)</label>
              <input
                id="farm-lon"
                type="number"
                step="any"
                placeholder="e.g. 76.77"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label htmlFor="farm-soil">Soil Type</label>
            <div style={{ position: 'relative' }}>
              <HiBeaker size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select
                id="farm-soil"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              >
                <option value="Clay">Clay</option>
                <option value="Sandy">Sandy</option>
                <option value="Loamy">Loamy</option>
                <option value="Silt">Silt</option>
                <option value="Peaty">Peaty</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Saving Plot...' : editMode ? 'Update Farm Details' : 'Register Farm Plot'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FarmForm;
