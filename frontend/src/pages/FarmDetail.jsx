import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFarmById, deleteFarm, getWeatherForFarm, getResourceSummary } from '../services/api';
import { HiArrowLeft, HiSun, HiScale, HiMapPin, HiCube } from 'react-icons/hi2';
import toast from 'react-hot-toast';

function FarmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState(null);
  const [weather, setWeather] = useState(null);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const farmData = await getFarmById(id);
        setFarm(farmData);

        // Fetch Weather
        try {
          const weatherData = await getWeatherForFarm(id);
          setWeather(weatherData);
        } catch (wErr) {
          console.warn('Weather fetch failed:', wErr);
        }

        // Fetch Resource summary
        try {
          const resourceData = await getResourceSummary(id);
          setResources(resourceData);
        } catch (rErr) {
          console.warn('Resource summary fetch failed:', rErr);
        }

      } catch (err) {
        toast.error('Failed to load farm details');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this farm? This action is irreversible.')) return;
    try {
      await deleteFarm(id);
      toast.success('Farm deleted successfully');
      navigate('/farms');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!farm) {
    return <div className="p-6 text-center text-muted">Farm not found.</div>;
  }

  const sectionStyle = {
    background: 'var(--gradient-card)',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    backdropFilter: 'blur(10px)',
  };

  return (
    <div style={{ padding: 'var(--space-6) var(--space-8)', maxWidth: '1000px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link to="/farms" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          <HiArrowLeft size={16} /> Back to Farms List
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-3)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-3xl)', fontFamily: "'Outfit', var(--font-family)", marginBottom: '2px' }}>
              {farm.name}
            </h2>
            <p style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <HiMapPin size={16} /> {farm.location}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Link to={`/farms/${id}/edit`} className="btn btn-secondary">Edit Details</Link>
            <button onClick={handleDelete} className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}>Delete Farm</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Farm Specs Card */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiScale size={20} className="text-accent" /> Farm Specifications
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Total Area</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{farm.area} acres</div>
            </div>
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Soil Type</div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }} className="text-accent">
                {farm.soilType || 'Not Specified'}
              </div>
            </div>
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Latitude</div>
              <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{farm.latitude || 'N/A'}</div>
            </div>
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Longitude</div>
              <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{farm.longitude || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Real-time Weather Integration */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiSun size={20} style={{ color: 'var(--warning)' }} /> Real-time Weather
          </h3>
          {weather ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Temperature</div>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{weather.temperature}°C</div>
              </div>
              <div style={{ padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Condition</div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{weather.condition}</div>
              </div>
              <div style={{ padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Wind Speed</div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{weather.windSpeed} km/h</div>
              </div>
              <div style={{ padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Humidity</div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{weather.humidity}%</div>
              </div>
            </div>
          ) : (
            <div style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', textAlign: 'center' }}>
              No coordinate details saved. Enter latitude and longitude to receive local weather data.
            </div>
          )}
        </div>
      </div>

      {/* Resource Utilization */}
      <div style={{ ...sectionStyle, marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiCube size={20} style={{ color: 'var(--info)' }} /> Resource Overview
        </h3>
        {resources ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--info)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Water</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                Used: {resources.waterUsed}L / {resources.waterAllocated}L
              </div>
              <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                Remaining: {resources.waterRemaining}L
              </div>
            </div>

            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--success)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Budget</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                Used: ₹{resources.budgetUsed} / ₹{resources.budgetAllocated}
              </div>
              <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                Remaining: ₹{resources.budgetRemaining}
              </div>
            </div>

            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--warning)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Labour</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                Used: {resources.labourUsed} hrs / {resources.labourAllocated} hrs
              </div>
              <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                Remaining: {resources.labourRemaining} hrs
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-4)' }}>
            No resource utilization logs recorded yet. Visit the Resources tab to track resource balances.
          </div>
        )}
      </div>

      {/* Advisory Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
        <Link to="/recommendation" className="btn btn-primary" style={{ padding: 'var(--space-4) var(--space-8)' }}>
          Get Crop Advisory Recommendation
        </Link>
        <Link to="/irrigation" className="btn btn-secondary" style={{ padding: 'var(--space-4) var(--space-8)' }}>
          Calculate Irrigation Schedule
        </Link>
      </div>
    </div>
  );
}

export default FarmDetail;
