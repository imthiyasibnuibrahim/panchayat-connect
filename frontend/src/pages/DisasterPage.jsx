import React, { useState, useEffect, useContext } from 'react';
import { Siren, AlertTriangle, ShieldCheck, MapPin, PhoneCall, Plus, Radio, CheckCircle2, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function DisasterPage() {
  const { user, isAuthority, isAdmin } = useContext(AuthContext);

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sosSent, setSosSent] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  // Broadcast Alert Form State (Authority / Admin)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    severity: 'high',
    category: 'Weather Warning',
    affectedWards: 'Ward 4, Ward 5',
    instructions: '',
  });

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/api/v1/disaster/alerts');
      setAlerts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load live disaster alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleTriggerSOS = async () => {
    try {
      setError('');
      setSuccessMsg('');
      await axios.post('/api/v1/disaster/sos', {
        citizenName: user?.name || 'Verified Citizen',
        phone: user?.phoneNumber || '+919876543210',
        wardNumber: user?.wardNumber || '4',
        houseNumber: user?.houseNumber || 'H-101',
      });
      setSosSent(true);
      setSuccessMsg('🚨 EMERGENCY SOS DISPATCHED! Disaster Rapid Action Force (NDRF & Ward 4 Officer) notified with your GPS credentials.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch SOS signal.');
    }
  };

  const handleBroadcastAlertSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await axios.post('/api/v1/disaster/alerts', newAlert);
      setSuccessMsg(`📢 Disaster warning broadcasted: "${newAlert.title}"`);
      setShowBroadcastModal(false);
      setNewAlert({
        title: '',
        severity: 'high',
        category: 'Weather Warning',
        affectedWards: 'Ward 4, Ward 5',
        instructions: '',
      });
      fetchAlerts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to broadcast warning.');
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (selectedSeverity === 'All') return true;
    return a.severity === selectedSeverity.toLowerCase();
  });

  const emergencyContacts = [
    { name: 'Ward 4 Disaster Rapid Action Force', phone: '1077', role: '24/7 Control Room' },
    { name: 'Fire & Rescue Station (Ward 4 Hub)', phone: '101', role: 'Emergency Rescue' },
    { name: 'Kerala State Disaster Control', phone: '112', role: 'State Command' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 🚨 Emergency Alert Banner Header */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 50%, #991B1B 100%)',
          color: 'white',
          padding: '28px 32px',
          borderRadius: '24px',
          boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          border: 'none',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
            <Radio size={14} className="animate-pulse" color="#FCA5A5" /> KaWaCHaM Disaster Warning Cell
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>
            Live Emergency & Disaster Response
          </h2>
          <p style={{ margin: '4px 0 0 0', opacity: 0.95, fontSize: '0.9rem', color: '#FEE2E2' }}>
            Ward {user?.wardNumber || '4'} Real-Time Geo-Targeted Warnings & One-Touch SOS Dispatch
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {(isAuthority || isAdmin) && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="btn"
              style={{ padding: '10px 18px', borderRadius: '9999px', background: '#F59E0B', color: 'white', fontWeight: '700', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Broadcast Warning
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="badge badge-emergency" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} /> <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="badge badge-approved" style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} /> <span>{successMsg}</span>
        </div>
      )}

      {/* 🔴 Big Red One-Touch SOS Rescue Signal Card */}
      <div
        className="card"
        style={{
          background: sosSent ? '#FEF2F2' : 'var(--surface-base)',
          border: sosSent ? '2px solid #DC2626' : '1px solid var(--border-divider)',
          borderRadius: '24px',
          padding: '32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div style={{ maxWidth: '480px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            {sosSent ? '🚨 Emergency SOS Dispatched!' : 'One-Touch Geo SOS Rescue Signal'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '6px' }}>
            In case of sudden flash flood, landslide, or fire emergency in Ward {user?.wardNumber || '4'}, tap the SOS button to instantly transmit your location to the Control Room.
          </p>
        </div>

        <button
          onClick={handleTriggerSOS}
          disabled={sosSent}
          className={`btn ${sosSent ? '' : 'emergency-ripple'}`}
          style={{
            background: sosSent ? '#16A34A' : '#DC2626',
            color: 'white',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            fontSize: '1.4rem',
            fontWeight: '900',
            flexDirection: 'column',
            gap: '4px',
            border: '4px solid white',
            boxShadow: sosSent ? '0 8px 24px rgba(22, 163, 74, 0.3)' : '0 8px 30px rgba(220, 38, 38, 0.4)',
            cursor: sosSent ? 'default' : 'pointer',
          }}
        >
          <Siren size={40} />
          <span>{sosSent ? 'SENT' : 'SOS'}</span>
        </button>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
          {sosSent ? '✓ Rescue Team Acknowledged • Stay Safe' : 'Tap to transmit GPS & Citizen Identity credentials'}
        </div>
      </div>

      {/* Emergency Hotlines Pills */}
      <div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>
          📞 24/7 Ward Control Hotlines
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {emergencyContacts.map((contact, i) => (
            <div key={i} className="card" style={{ padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{contact.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{contact.role}</div>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="btn btn-outline"
                style={{ padding: '8px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '800', color: '#DC2626', borderColor: '#FCA5A5', textDecoration: 'none' }}
              >
                <PhoneCall size={14} /> {contact.phone}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
          📢 Active Geo-Targeted Warnings ({filteredAlerts.length})
        </h4>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className="btn"
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: selectedSeverity === sev ? '700' : '600',
                background: selectedSeverity === sev ? 'var(--primary-emerald)' : 'var(--surface-base)',
                color: selectedSeverity === sev ? 'white' : 'var(--text-primary)',
                border: selectedSeverity === sev ? 'none' : '1px solid var(--border-divider)',
              }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Warnings List */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading warnings...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={40} color="#10B981" style={{ marginBottom: '8px' }} />
          <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>No active disaster warnings for Ward {user?.wardNumber || '4'}</h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>All local weather and safety metrics are normal.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredAlerts.map((alert) => {
            const isHigh = alert.severity === 'high' || alert.severity === 'emergency';
            return (
              <div
                key={alert._id}
                className="card"
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  borderLeft: `6px solid ${isHigh ? '#DC2626' : alert.severity === 'medium' ? '#D97706' : '#2563EB'}`,
                  background: isHigh ? '#FEF2F2' : 'var(--surface-base)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <span className={`badge ${isHigh ? 'badge-emergency' : alert.severity === 'medium' ? 'badge-pending' : 'badge-info'}`} style={{ marginBottom: '8px' }}>
                      {alert.severity?.toUpperCase()} SEVERITY WARNING
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{alert.title}</h3>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    {new Date(alert.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p style={{ margin: '8px 0 14px 0', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  {alert.instructions || alert.message || 'Follow ward officer directives and stay indoors.'}
                </p>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="#047857" /> Affected: {alert.affectedWards || alert.panchayatName || 'Ward 4'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={14} color="#D97706" /> Category: {alert.category || 'Weather'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Authority Broadcast Warning Modal */}
      {showBroadcastModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '24px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#DC2626', fontWeight: '800', fontSize: '1.2rem' }}>Broadcast Emergency Warning</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="btn" style={{ background: 'transparent', padding: '4px', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleBroadcastAlertSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Alert Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Flood Red Alert for Ward 4 Lowlands"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Severity Level *</label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                  >
                    <option value="high">HIGH (Red Alert)</option>
                    <option value="medium">MEDIUM (Amber Alert)</option>
                    <option value="low">LOW (Info Advisory)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Category *</label>
                  <input
                    type="text"
                    required
                    value={newAlert.category}
                    onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Affected Wards *</label>
                <input
                  type="text"
                  required
                  value={newAlert.affectedWards}
                  onChange={(e) => setNewAlert({ ...newAlert, affectedWards: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Safety Directives & Instructions *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Move to Ward 4 Relief Camp immediately. Avoid rivers."
                  value={newAlert.instructions}
                  onChange={(e) => setNewAlert({ ...newAlert, instructions: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>

              <button type="submit" className="btn btn-danger" style={{ padding: '14px', marginTop: '6px', fontWeight: '800', borderRadius: '9999px' }}>
                Broadcast Live Warning Now
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
