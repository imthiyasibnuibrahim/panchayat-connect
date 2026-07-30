import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, ShieldAlert, ShoppingBag, Landmark, User, CheckCircle2, Lock, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDevPresets, setShowDevPresets] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const demoAccounts = [
    {
      roleName: 'Central Admin',
      phone: '+919999999999',
      pass: 'password123',
      icon: <ShieldAlert size={14} color="#DC2626" />,
      desc: 'Central User & Role Governance',
    },
    {
      roleName: 'Kudumbashree Seller',
      phone: '+917777777777',
      pass: 'password123',
      icon: <ShoppingBag size={14} color="#059669" />,
      desc: 'Approved Kudumbashree Unit',
    },
    {
      roleName: 'Panchayat Authority',
      phone: '+916666666666',
      pass: 'password123',
      icon: <Landmark size={14} color="#2563EB" />,
      desc: 'Verified Panchayat Official',
    },
    {
      roleName: 'Standard Citizen',
      phone: '+918888888888',
      pass: 'password123',
      icon: <User size={14} color="#4B5563" />,
      desc: 'Verified Citizen Account',
    },
  ];

  const handleSelectPreset = (accPhone, accPass) => {
    setPhone(accPhone);
    setPassword(accPass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Invalid phone number or password.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)', padding: '24px' }}>
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '36px 32px', borderRadius: '16px', borderTop: '4px solid var(--primary)', background: 'white' }}>
        
        {/* Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: '#ECFDF5', borderRadius: '50%', color: '#059669', marginBottom: '12px' }}>
            <Lock size={28} />
          </div>
          <h2 style={{ margin: 0, color: 'var(--primary)', fontWeight: '700', fontSize: '1.6rem' }}>
            Panchayat Connect
          </h2>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Secure Multi-Tier Portal Authentication
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', borderLeft: '4px solid #EF4444', color: '#B91C1C', padding: '12px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Real Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>Registered Phone Number</label>
            <input 
              type="text" 
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="glass-panel" 
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="glass-panel" 
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }} 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px', padding: '12px', fontWeight: '600', borderRadius: '8px' }}>
            <LogIn size={18} /> Authenticate Session
          </button>
        </form>

        {/* Security Policy Info Box */}
        <div style={{ marginTop: '20px', background: '#F9FAFB', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          <div style={{ fontWeight: '600', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <ShieldCheck size={14} /> Strict Admin Verification Policy:
          </div>
          All new accounts register as <strong>Citizens</strong>. Kudumbashree Units and Authorities require <strong>Central Admin approval</strong> to elevate permissions before listing products or broadcasting alerts.
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: '600' }}>
            Register as Citizen
          </Link>
        </div>

        {/* Optional Dev Preset Switcher (Collapsed by default) */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #F3F4F6', paddingTop: '14px' }}>
          <button
            type="button"
            onClick={() => setShowDevPresets(!showDevPresets)}
            style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifySelf: 'center', gap: '4px', margin: '0 auto' }}
          >
            <span>🛠️ Developer / Testing Presets</span>
            {showDevPresets ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showDevPresets && (
            <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '8px', border: '1px dashed #D1D5DB' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#6B7280', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
                Autofill Credentials for Testing:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.phone}
                    type="button"
                    onClick={() => handleSelectPreset(acc.phone, acc.pass)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #E5E7EB',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {acc.icon} <span>{acc.roleName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
