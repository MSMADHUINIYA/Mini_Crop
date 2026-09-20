import React, { useState, useEffect } from 'react';
import { calculateIrrigationPlan, getFarms } from '../services/api';
import { HiCloudArrowDown, HiBeaker, HiScale, HiArrowTrendingUp } from 'react-icons/hi2';
import toast from 'react-hot-toast';

function IrrigationPage() {
  const [farms, setFarms] = useState([]);
  const [form, setForm] = useState({
    farmId: '',
    rainfall: '',
    evapotranspiration: '',
    area: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingFarms, setFetchingFarms] = useState(true);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await getFarms();
        const farmList = Array.isArray(data) ? data : [];
        setFarms(farmList);
        if (farmList.length > 0) {
          setForm({
            farmId: farmList[0].id.toString(),
            rainfall: '',
            evapotranspiration: '',
            area: farmList[0].area ? farmList[0].area.toString() : ''
          });
        }
      } catch (err) {
        toast.error('Failed to load farms');
      } finally {
        setFetchingFarms(false);
      }
    };
    fetchFarms();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'farmId') {
      const selectedFarm = farms.find(f => f.id.toString() === value);
      setForm(prev => ({
        ...prev,
        farmId: value,
        area: selectedFarm ? selectedFarm.area.toString() : prev.area
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.farmId) {
      toast.error('Please select a farm plot.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        farmId: parseInt(form.farmId, 10),
        rainfall: parseFloat(form.rainfall),
        evapotranspiration: parseFloat(form.evapotranspiration),
        area: parseFloat(form.area)
      };
      const data = await calculateIrrigationPlan(payload);
      setResult(data);
      toast.success('Irrigation schedule calculated!');
    } catch (err) {
      toast.error('Failed to calculate irrigation plan');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    padding: 'var(--space-6) var(--space-8)',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
  };

  if (fetchingFarms) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div style={containerStyle} className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontFamily: "'Outfit', var(--font-family)", marginBottom: 'var(--space-1)' }}>
          Irrigation Scheduler
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Determine precise water volumes needed per farm based on rainfall deficit, evapotranspiration rates, and plot size.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '4fr 5fr' : '1fr', gap: 'var(--space-8)' }}>
        
        {/* Form Card */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiBeaker size={20} className="text-accent" /> Soil Hydration Parameters
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="farm-select">Select Farm Plot</label>
              <select
                id="farm-select"
                name="farmId"
                value={form.farmId}
                onChange={handleChange}
                required
              >
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.area} ac)</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="input-area">Farm Area Size (acres - auto populated)</label>
              <input
                id="input-area"
                name="area"
                type="number"
                step="any"
                value={form.area}
                onChange={handleChange}
                required
                readOnly
                style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div>
                <label htmlFor="input-rain">Recent Rainfall (mm)</label>
                <input
                  id="input-rain"
                  name="rainfall"
                  type="number"
                  step="any"
                  placeholder="e.g. 5"
                  value={form.rainfall}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="input-evap">Evapotranspiration (mm)</label>
                <input
                  id="input-evap"
                  name="evapotranspiration"
                  type="number"
                  step="any"
                  placeholder="e.g. 12"
                  value={form.evapotranspiration}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
              {loading ? 'Calculating scheduler...' : 'Calculate Water Plan'}
            </button>
          </form>
        </div>

        {/* Result Card */}
        {result && (
          <div className="card animate-fade-in" style={{ 
            padding: 'var(--space-8)', 
            borderLeft: '4px solid var(--info)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: 'var(--space-2)' }}>💧</span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>PLAN IDENTIFIER: #{result.id || 'NEW'}</span>
            <h3 style={{ fontSize: 'var(--font-size-2xl)', marginTop: '4px', marginBottom: 'var(--space-2)' }}>Irrigation Schedule Ready</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}>
              We calculated the soil moisture deficits for your plot <strong>{result.farmName}</strong> based on weather inputs.
            </p>

            <div style={{ background: 'var(--bg-input)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-secondary)', marginBottom: 'var(--space-6)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>REQUIRED WATER VOLUME</div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--info)', marginTop: '2px' }}>
                {typeof result.waterNeededLiters === 'number' ? result.waterNeededLiters.toLocaleString(undefined, {maximumFractionDigits:1}) : (result.waterNeededLiters || '0')} Liters
              </div>
            </div>

            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              * Deficit is calculated as: Max(0, Evapotranspiration - Rainfall) * Area conversion multipliers. Ensure drip channels are clear.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default IrrigationPage;
