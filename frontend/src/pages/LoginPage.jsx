import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, ShieldAlert, ShoppingBag, Landmark, User, CheckCircle2, Lock, ShieldCheck, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

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
      icon: <ShieldAlert size={14} color="#4338CA" />,
      desc: 'Governance & User Access',
      badgeClass: 'role-badge-admin',
    },
    {
      roleName: 'Kudumbashree Seller',
      phone: '+917777777777',
      pass: 'password123',
      icon: <ShoppingBag size={14} color="#B45309" />,
      desc: 'Approved Kudumbashree Unit',
      badgeClass: 'role-badge-farmer',
    },
    {
      roleName: 'Panchayat Authority',
      phone: '+916666666666',
      pass: 'password123',
      icon: <Landmark size={14} color="#1E293B" />,
      desc: 'Panchayat Officer',
      badgeClass: 'role-badge-employee',
    },
    {
      roleName: 'Standard Citizen',
      phone: '+918888888888',
      pass: 'password123',
      icon: <User size={14} color="#047857" />,
      desc: 'Verified Ward Resident',
      badgeClass: 'role-badge-citizen',
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', background: 'var(--canvas-bg)', padding: '24px 16px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '40px 36px', borderRadius: '24px', background: 'var(--surface-base)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-divider)' }}>
        
        {/* Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', padding: '14px', background: '#ECFDF5', borderRadius: '50%', color: 'var(--primary-emerald)', marginBottom: '14px', border: '1px solid #A7F3D0' }}>
            <Lock size={30} />
          </div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.7rem', letterSpacing: '-0.03em' }}>
            Panchayat Connect
          </h2>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Smart Kerala Citizen & Multi-Role Governance Portal
          </p>
        </div>

        {error && (
          <div className="badge badge-emergency" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Real Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              Registered Phone Number
            </label>
            <input 
              type="text" 
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '0.95rem' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              Account Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '0.95rem' }} 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px', padding: '14px', fontWeight: '700', borderRadius: '9999px', fontSize: '0.95rem' }}>
            <LogIn size={18} /> Authenticate Session
          </button>
        </form>

        {/* Security Policy Info Box */}
        <div style={{ marginTop: '24px', background: '#F8FAFC', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-divider)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <div style={{ fontWeight: '700', color: 'var(--primary-emerald)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={16} /> Verified Citizen Identity Policy:
          </div>
          All standard registrations activate as <strong>Citizens</strong>. Kudumbashree Units and Panchayat Authorities require <strong>Central Admin authorization</strong>.
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-emerald)', textDecoration: 'none', fontWeight: '700' }}>
            Register as Citizen
          </Link>
        </div>

        {/* Developer Testing Presets */}
        <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-divider)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => setShowDevPresets(!showDevPresets)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifySelf: 'center', gap: '6px', margin: '0 auto' }}
          >
            <Sparkles size={14} color="var(--secondary-amber)" />
            <span>Developer / Testing Presets</span>
            {showDevPresets ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDevPresets && (
            <div style={{ marginTop: '14px', background: 'var(--canvas-bg)', padding: '14px', borderRadius: '14px', border: '1px dashed #CBD5E1' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px', textAlign: 'center', letterSpacing: '0.04em' }}>
                Autofill Demo Credentials:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.phone}
                    type="button"
                    onClick={() => handleSelectPreset(acc.phone, acc.pass)}
                    className="btn btn-outline"
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      fontSize: '0.76rem',
                      justifyContent: 'flex-start',
                      fontWeight: '600',
                      gap: '6px',
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

