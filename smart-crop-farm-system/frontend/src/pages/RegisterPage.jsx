import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiUser, HiEnvelope, HiLockClosed, HiShieldCheck, HiArrowRight } from 'react-icons/hi2';

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('FARMER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - var(--navbar-height))',
      padding: 'var(--space-4)',
      background: 'var(--gradient-hero)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        animation: 'fadeInUp 0.5s ease forwards',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)',
            boxShadow: 'var(--shadow-glow-strong)',
          }}>
            <span style={{ fontSize: '28px' }}>🌱</span>
          </div>
          <h1 style={{
            fontSize: 'var(--font-size-3xl)',
            fontFamily: "'Outfit', var(--font-family)",
            marginBottom: 'var(--space-2)',
          }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Join AgriSmart to optimize your farm resources
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'var(--gradient-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          backdropFilter: 'blur(10px)',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="reg-name" style={{ marginBottom: 'var(--space-2)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <HiUser size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="reg-email" style={{ marginBottom: 'var(--space-2)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <HiEnvelope size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="reg-password" style={{ marginBottom: 'var(--space-2)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <HiLockClosed size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  id="reg-password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label htmlFor="reg-role" style={{ marginBottom: 'var(--space-2)' }}>Account Role</label>
              <div style={{ position: 'relative' }}>
                <HiShieldCheck size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <select
                  id="reg-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                >
                  <option value="FARMER">Farmer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg"
              style={{ marginBottom: 'var(--space-4)' }}
            >
              {loading ? (
                <><div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Registering...</>
              ) : (
                <>Sign Up <HiArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border-secondary)',
          }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 600 }}>Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
