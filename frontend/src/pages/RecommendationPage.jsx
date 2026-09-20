import React, { useState, useEffect } from 'react';
import { getCropRecommendation, getFarms } from '../services/api';
import { HiScale, HiBeaker, HiSun, HiChartBar, HiArrowTrendingUp, HiAcademicCap } from 'react-icons/hi2';
import toast from 'react-hot-toast';

function RecommendationPage() {
  const [farms, setFarms] = useState([]);
  const [form, setForm] = useState({
    nitrogen: '', phosphorus: '', potassium: '', temperature: '', humidity: '', pH: '', rainfall: '', farmId: ''
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
          setForm(prev => ({ ...prev, farmId: farmList[0].id.toString() }));
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
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.farmId) {
      toast.error('Please register a farm plot first.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        nitrogen: parseFloat(form.nitrogen),
        phosphorus: parseFloat(form.phosphorus),
        potassium: parseFloat(form.potassium),
        temperature: parseFloat(form.temperature),
        humidity: parseFloat(form.humidity),
        pH: parseFloat(form.pH),
        rainfall: parseFloat(form.rainfall),
        farmId: parseInt(form.farmId, 10)
      };
      const data = await getCropRecommendation(payload);
      setResult(data);
      toast.success('Recommendations calculated successfully!');
    } catch (err) {
      toast.error('Failed to calculate recommendation');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    padding: 'var(--space-6) var(--space-8)',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
  };

  const formGroupStyle = {
    marginBottom: 'var(--space-4)',
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
          Precision Crop Advice
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Enter soil nutrients and atmospheric metrics to determine the most suitable crops, yield explanations, and profit potentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '4fr 6fr' : '1fr', gap: 'var(--space-8)' }}>
        
        {/* Form Card */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiBeaker size={20} className="text-accent" /> Soil & Climate Metrics
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={formGroupStyle}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <div style={formGroupStyle}>
                <label htmlFor="input-n">Nitrogen (N)</label>
                <input
                  id="input-n"
                  name="nitrogen"
                  type="number"
                  step="any"
                  placeholder="e.g. 80"
                  value={form.nitrogen}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label htmlFor="input-p">Phosphorus (P)</label>
                <input
                  id="input-p"
                  name="phosphorus"
                  type="number"
                  step="any"
                  placeholder="e.g. 40"
                  value={form.phosphorus}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label htmlFor="input-k">Potassium (K)</label>
                <input
                  id="input-k"
                  name="potassium"
                  type="number"
                  step="any"
                  placeholder="e.g. 40"
                  value={form.potassium}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={formGroupStyle}>
                <label htmlFor="input-temp">Temp (°C)</label>
                <input
                  id="input-temp"
                  name="temperature"
                  type="number"
                  step="any"
                  placeholder="e.g. 27"
                  value={form.temperature}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label htmlFor="input-humid">Humidity (%)</label>
                <input
                  id="input-humid"
                  name="humidity"
                  type="number"
                  step="any"
                  placeholder="e.g. 80"
                  value={form.humidity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={formGroupStyle}>
                <label htmlFor="input-ph">Soil pH</label>
                <input
                  id="input-ph"
                  name="pH"
                  type="number"
                  step="any"
                  placeholder="e.g. 6.2"
                  value={form.pH}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label htmlFor="input-rain">Rainfall (mm)</label>
                <input
                  id="input-rain"
                  name="rainfall"
                  type="number"
                  step="any"
                  placeholder="e.g. 180"
                  value={form.rainfall}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
              {loading ? 'Analyzing Data...' : 'Calculate Advisory'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiArrowTrendingUp size={20} className="text-accent" /> Recommended Candidates
            </h3>

            {result.candidates && result.candidates.map((c, index) => {
              const score = typeof c.suitabilityScore === 'number' ? c.suitabilityScore.toFixed(1) : (c.suitabilityScore || '0');
              const minProfit = typeof c.estimatedProfitMin === 'number' ? c.estimatedProfitMin.toLocaleString(undefined, {maximumFractionDigits:0}) : (c.estimatedProfitMin || '0');
              const maxProfit = typeof c.estimatedProfitMax === 'number' ? c.estimatedProfitMax.toLocaleString(undefined, {maximumFractionDigits:0}) : (c.estimatedProfitMax || '0');
              return (
              <div key={c.cropName || index} className="card" style={{ 
                padding: 'var(--space-5)', 
                borderLeft: index === 0 ? '4px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                background: index === 0 ? 'var(--gradient-card)' : 'rgba(16, 42, 28, 0.4)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>CANDIDATE #{index + 1}</span>
                    <h4 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)' }}>{c.cropName}</h4>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {score}%
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Suitability Match</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ height: '6px', background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
                  <div style={{ width: `${Math.min(100, Math.max(0, Number(c.suitabilityScore) || 0))}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: 'var(--radius-full)' }}></div>
                </div>

                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                  {c.explanation}
                </p>

                {/* Profit Estimation details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <HiChartBar size={16} /> Est. Profit (per acre):
                  </span>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--success)' }}>
                    ₹{minProfit} - ₹{maxProfit}
                  </span>
                </div>
              </div>
            );})}
          </div>
        )}

      </div>
    </div>
  );
}

export default RecommendationPage;
