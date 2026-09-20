import React, { useEffect, useState } from 'react';
import { getFarms, deleteFarm } from '../services/api';
import { Link } from 'react-router-dom';
import { HiPlus, HiEye, HiPencilSquare, HiTrash, HiGlobeAlt } from 'react-icons/hi2';
import toast from 'react-hot-toast';

function FarmList() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFarms = async () => {
    try {
      const data = await getFarms();
      setFarms(data);
    } catch (err) {
      toast.error('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this farm?')) return;
    try {
      await deleteFarm(id);
      toast.success('Farm deleted successfully');
      setFarms(farms.filter((f) => f.id !== id));
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const containerStyle = {
    padding: 'var(--space-6) var(--space-8)',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
  };

  const tableHeaderStyle = {
    textAlign: 'left',
    padding: 'var(--space-3) var(--space-4)',
    color: 'var(--text-muted)',
    fontWeight: 500,
    borderBottom: '1px solid var(--border-primary)',
  };

  const tableCellStyle = {
    padding: 'var(--space-4)',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-secondary)',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div style={containerStyle} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontFamily: "'Outfit', var(--font-family)", marginBottom: 'var(--space-1)' }}>
            Your Farms
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Manage registered farm plots, soil types, and coordinates.
          </p>
        </div>
        <Link to="/farms/new" className="btn btn-primary">
          <HiPlus size={18} /> Add New Farm
        </Link>
      </div>

      {farms.length === 0 ? (
        <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: 'var(--space-4)' }}>🌾</span>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>No Registered Farms</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
            Register your first farm plot to calculate irrigation and receive crop recommendations.
          </p>
          <Link to="/farms/new" className="btn btn-primary">
            Register a Farm
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={tableHeaderStyle}>Farm Name</th>
                  <th style={tableHeaderStyle}>Location</th>
                  <th style={tableHeaderStyle}>Area (acres)</th>
                  <th style={tableHeaderStyle}>Soil Type</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {farms.map((farm) => (
                  <tr key={farm.id} style={{ transition: 'background var(--transition-fast)' }} className="hover-row">
                    <td style={{ ...tableCellStyle, fontWeight: 600, color: 'var(--text-primary)' }}>{farm.name}</td>
                    <td style={tableCellStyle}>{farm.location}</td>
                    <td style={tableCellStyle}>{farm.area} ac</td>
                    <td style={tableCellStyle}>
                      {farm.soilType ? (
                        <span className="badge badge-accent">{farm.soilType}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>Not Set</span>
                      )}
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                        <Link to={`/farms/${farm.id}`} className="btn btn-ghost btn-sm" title="View Details" style={{ padding: '6px' }}>
                          <HiEye size={16} />
                        </Link>
                        <Link to={`/farms/${farm.id}/edit`} className="btn btn-ghost btn-sm" title="Edit Farm" style={{ padding: '6px', color: 'var(--accent-secondary)' }}>
                          <HiPencilSquare size={16} />
                        </Link>
                        <button onClick={() => handleDelete(farm.id)} className="btn btn-ghost btn-sm" title="Delete Farm" style={{ padding: '6px', color: 'var(--danger)' }}>
                          <HiTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmList;
