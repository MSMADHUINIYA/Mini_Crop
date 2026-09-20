import React, { useEffect, useState } from 'react';
import { getFarms, getActionPlans, createActionPlan, updateActionPlanStatus, verifyAndReplan } from '../services/api';
import { HiPlus, HiCheck, HiArrowPath, HiCalendar, HiFlag } from 'react-icons/hi2';
import toast from 'react-hot-toast';

function ActionPlanPage() {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: '2',
    dueDate: ''
  });

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

  const fetchPlans = async (farmId) => {
    if (!farmId) return;
    setLoading(true);
    try {
      const plansData = await getActionPlans(farmId);
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (err) {
      toast.error('Failed to load action plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFarmId) {
      fetchPlans(selectedFarmId);
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
      await createActionPlan(selectedFarmId, {
        title: form.title,
        description: form.description,
        priority: parseInt(form.priority, 10),
        dueDate: form.dueDate
      });
      
      toast.success('Task registered successfully!');
      setForm({ title: '', description: '', priority: '2', dueDate: '' });
      fetchPlans(selectedFarmId);
    } catch (err) {
      toast.error('Failed to register task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (planId, currentStatus) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await updateActionPlanStatus(planId, newStatus);
      toast.success('Task status updated');
      fetchPlans(selectedFarmId);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleVerifyAndReplan = async () => {
    if (!selectedFarmId) return;
    setVerifying(true);
    try {
      const resData = await verifyAndReplan(selectedFarmId);
      
      const { replanNeeded, message } = resData || {};
      if (replanNeeded) {
        toast((t) => (
          <span>
            ⚠️ <strong>Replanning Triggered:</strong> {message}
          </span>
        ), { duration: 6000 });
      } else {
        toast.success(message || 'Farm verification completed');
      }
      
      fetchPlans(selectedFarmId);
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
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
            Farm Action Planner
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Schedule farming task priorities. Run verification checks to auto-recalculate action plans when resource deficits emerge.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <select value={selectedFarmId} onChange={handleFarmChange} style={{ minWidth: '180px' }}>
            {farms.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button 
            onClick={handleVerifyAndReplan} 
            className="btn btn-secondary" 
            disabled={verifying}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', borderColor: 'var(--border-accent)' }}
          >
            <HiArrowPath size={16} className={verifying ? 'animate-spin' : ''} />
            Verify & Replan Plot
          </button>
        </div>
      </div>

      {farms.length === 0 ? (
        <div className="card text-center" style={{ padding: 'var(--space-12)' }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: 'var(--space-4)' }}>🌾</span>
          <h3>Register a Farm Plot First</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            You need to create a farm plot before scheduling task plans.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: 'var(--space-8)' }}>
          
          {/* Action Form */}
          <div className="card" style={{ padding: 'var(--space-6)', height: 'fit-content' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiPlus size={20} className="text-accent" /> Create Action Item
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="act-title">Task Title</label>
                <input
                  id="act-title"
                  name="title"
                  type="text"
                  placeholder="e.g. Apply Nitrogen Fertilizers"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label htmlFor="act-desc">Description (Optional)</label>
                <textarea
                  id="act-desc"
                  name="description"
                  placeholder="Details of the action..."
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div>
                  <label htmlFor="act-priority">Priority</label>
                  <select id="act-priority" name="priority" value={form.priority} onChange={handleChange}>
                    <option value="1">High Priority (1)</option>
                    <option value="2">Medium Priority (2)</option>
                    <option value="3">Low Priority (3)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="act-date">Due Date</label>
                  <input
                    id="act-date"
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
                {submitting ? 'Creating task...' : 'Schedule Task'}
              </button>
            </form>
          </div>

          {/* Action List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiCalendar size={20} className="text-accent" /> Active Tasks Schedule
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {plans.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--space-8)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No tasks scheduled for this farm. Add one on the left or run a verification check.</p>
                </div>
              ) : (
                plans.map(p => (
                  <div key={p.id} className="card" style={{ 
                    padding: 'var(--space-4) var(--space-5)',
                    background: p.status === 'COMPLETED' ? 'rgba(16, 42, 28, 0.2)' : 'var(--gradient-card)',
                    opacity: p.status === 'COMPLETED' ? 0.7 : 1,
                    borderLeft: p.status === 'REPLANNED' ? '4px solid var(--warning)' : p.status === 'COMPLETED' ? '4px solid var(--success)' : '4px solid var(--info)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                        <button 
                          onClick={() => handleStatusChange(p.id, p.status)} 
                          style={{
                            width: '20px', height: '20px', borderRadius: '4px', 
                            border: '2px solid var(--border-accent)', background: p.status === 'COMPLETED' ? 'var(--accent-primary)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyCenter: 'center', cursor: 'pointer',
                            marginTop: '2px'
                          }}
                        >
                          {p.status === 'COMPLETED' && <HiCheck size={14} style={{ color: 'var(--bg-primary)' }} />}
                        </button>
                        <div>
                          <div style={{ fontWeight: 600, color: p.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: p.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                            {p.title}
                          </div>
                          {p.description && (
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {p.description}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <HiCalendar size={12} /> Due: {p.dueDate}
                            </span>
                            <span style={{ fontSize: '10px', color: p.priority === 1 ? 'var(--danger)' : p.priority === 2 ? 'var(--warning)' : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <HiFlag size={10} /> Priority {p.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className={`badge ${p.status === 'COMPLETED' ? 'badge-success' : p.status === 'REPLANNED' ? 'badge-warning' : 'badge-info'}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default ActionPlanPage;
