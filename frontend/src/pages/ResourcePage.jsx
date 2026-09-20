import React, { useEffect, useState } from 'react';
import { getFarms, getResourceLogs, getResourceSummary, createResourceLog } from '../services/api';
import { HiPlus } from 'react-icons/hi2';
import toast from 'react-hot-toast';

function ResourcePage() {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState({
    type: 'WATER',
    allocated: '',
    used: '',
    note: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await getFarms();
        const farmList = Array.isArray(data) ? data : [];
        setFarms(farmList);
        if (farmList.length > 0) {
          setSelectedFarmId(farmList[0].id.toString());
        } else {
          setLoading(false);
        }
      } catch (err) {
        toast.error('Failed to load farms');
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  const fetchLogsAndSummary = async (farmId) => {
    if (!farmId) return;
    setLoading(true);
    try {
      const logsData = await getResourceLogs(farmId);
      setLogs(Array.isArray(logsData) ? logsData : []);

      const summaryData = await getResourceSummary(farmId);
      setSummary(summaryData);

    } catch (err) {
      toast.error('Failed to load resource data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFarmId) {
      fetchLogsAndSummary(selectedFarmId);
    }
  }, [selectedFarmId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFarmChange = e => {
    setSelectedFarmId(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedFarmId) {
      toast.error('Please select a farm plot first.');
      return;
    }
    setSubmitting(true);
    try {
      await createResourceLog(selectedFarmId, {
        type: form.type,
        allocated: parseFloat(form.allocated),
        used: parseFloat(form.used),
        note: form.note
      });
      
      toast.success('Resource log registered successfully!');
      setForm({ type: 'WATER', allocated: '', used: '', note: '' });
      fetchLogsAndSummary(selectedFarmId);
    } catch (err) {
      toast.error('Failed to add resource log');
    } finally {
      setSubmitting(false);
    }
  };

  const containerStyle = {
    padding: 'var(--space-6) var(--space-8)',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
  };

  if (loading && farms.length === 0) {
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
            Resource Allocation & Tracking
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Monitor and balance water, budgets, and labour allocations across farm plots to avoid resource deficit conditions.
          </p>
        </div>
        <div>
          <label htmlFor="farm-select-res" style={{ display: 'none' }}>Select Farm Plot</label>
          <select id="farm-select-res" value={selectedFarmId} onChange={handleFarmChange} style={{ minWidth: '200px' }}>
            {farms.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {farms.length === 0 ? (
        <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: 'var(--space-4)' }}>🌾</span>
          <h3>Register a Farm Plot First</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            You need to create a farm plot before managing resources.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: 'var(--space-8)' }}>
          
          {/* Allocator Form */}
          <div className="card" style={{ padding: 'var(--space-6)', height: 'fit-content' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiPlus size={20} className="text-accent" /> Log Resource Allocation
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="res-type">Resource Category</label>
                <select id="res-type" name="type" value={form.type} onChange={handleChange}>
                  <option value="WATER">Water (Liters)</option>
                  <option value="BUDGET">Budget (INR / ₹)</option>
                  <option value="LABOUR">Labour (Man Hours)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label htmlFor="res-allocated">Allocated Value</label>
                  <input
                    id="res-allocated"
                    name="allocated"
                    type="number"
                    step="any"
                    placeholder="e.g. 5000"
                    value={form.allocated}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="res-used">Used Value</label>
                  <input
                    id="res-used"
                    name="used"
                    type="number"
                    step="any"
                    placeholder="e.g. 1200"
                    value={form.used}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label htmlFor="res-note">Annotation / Note</label>
                <input
                  id="res-note"
                  name="note"
                  type="text"
                  placeholder="e.g. Initial planting water cycle"
                  value={form.note}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
                {submitting ? 'Registering log...' : 'Register Log Entry'}
              </button>
            </form>
          </div>

          {/* Statistics View */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Visual Gauges */}
            {summary && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                <div style={{ padding: 'var(--space-4)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)', borderLeft: '4px solid var(--info)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>WATER REMAINING</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--info)', marginTop: '2px' }}>
                    {summary.waterRemaining.toLocaleString()} L
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Used: {summary.waterUsed.toLocaleString()}L
                  </div>
                </div>

                <div style={{ padding: 'var(--space-4)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)', borderLeft: '4px solid var(--success)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>BUDGET REMAINING</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
                    ₹{summary.budgetRemaining.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Used: ₹{summary.budgetUsed.toLocaleString()}
                  </div>
                </div>

                <div style={{ padding: 'var(--space-4)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)', borderLeft: '4px solid var(--warning)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>LABOUR REMAINING</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--warning)', marginTop: '2px' }}>
                    {summary.labourRemaining.toLocaleString()} hrs
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Used: {summary.labourUsed.toLocaleString()} hrs
                  </div>
                </div>
              </div>
            )}

            {/* List of Resource Logs */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
                <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>History Logs</h4>
              </div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {logs.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>No resource allocations logged yet.</p>
                ) : (
                  logs.map(log => (
                    <div key={log.id} style={{
                      padding: 'var(--space-4) var(--space-5)',
                      borderBottom: '1px solid var(--border-secondary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${log.resourceType === 'WATER' ? 'badge-info' : log.resourceType === 'BUDGET' ? 'badge-success' : 'badge-warning'}`}>
                            {log.resourceType}
                          </span>
                          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                            {log.note || 'Allocation Cycle'}
                          </span>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Allocated: {log.allocated} | Used: {log.used}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: log.remaining < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                          Bal: {log.remaining.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ResourcePage;
