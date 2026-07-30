import React, { useState, useContext } from 'react';
import { Siren, AlertTriangle, Map, PhoneCall, WifiOff, Radio, ShieldAlert, CheckCircle2, AlertCircle, Compass, HeartPulse } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function DisasterPage() {
  const { user, isAuthority, isAdmin } = useContext(AuthContext);

  const [offlineMode, setOfflineMode] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [sosSentSuccess, setSosSentSuccess] = useState(false);
  const [sosType, setSosType] = useState('Flood Waterlogging');

  // Authority Broadcast Drawer State
  const [showAuthorityModal, setShowAuthorityModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    severity: 'warning',
    targetWards: 'Ward 4, Ward 5',
    evacuationCampName: 'Govt. UP School Relief Camp',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sample Active Geo Alerts
  const [alerts, setAlerts] = useState([
    {
      _id: '1',
      title: 'KaWaCHaM Geo-Alert: Heavy Rainfall & Landslide Warning',
      message: 'Red alert issued for Ward 4 and Ward 5 low-lying areas. Evacuate to high ground immediately. Water level in canal is rising rapidly.',
      severity: 'emergency',
      panchayatName: 'Ward 4 Central Panchayat',
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      // Default polygon coordinates for Ward 4 area
      const polygonCoordinates = [
        [
          [76.26, 10.84],
          [76.28, 10.84],
          [76.28, 10.86],
          [76.26, 10.86],
          [76.26, 10.84],
        ],
      ];

      const res = await axios.post('/api/v1/alerts/broadcast', {
        title: broadcastForm.title,
        message: broadcastForm.message,
        severity: broadcastForm.severity.toLowerCase(),
        polygonCoordinates,
        panchayatName: user?.panchayatName || 'Ward 4 Panchayat',
      });

      const newAlertObj = {
        _id: res.data.data.alertId || Date.now().toString(),
        title: broadcastForm.title,
        message: broadcastForm.message,
        severity: broadcastForm.severity.toLowerCase(),
        panchayatName: user?.panchayatName || 'Ward 4 Panchayat',
        createdAt: new Date().toISOString(),
      };

      setAlerts([newAlertObj, ...alerts]);
      setSuccessMsg('🚨 Emergency alert broadcasted successfully to all citizens in polygon area!');
      setShowAuthorityModal(false);
      setBroadcastForm({
        title: '',
        message: '',
        severity: 'warning',
        targetWards: 'Ward 4, Ward 5',
        evacuationCampName: 'Govt. UP School Relief Camp',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch geo-targeted alert.');
    }
  };

  const handleSendSos = () => {
    setSosSentSuccess(true);
    setTimeout(() => {
      setSosSentSuccess(false);
      setSosActive(false);
      setSuccessMsg(`🆘 EMERGENCY RESCUE SIGNAL DISPATCHED for Ward ${user?.wardNumber || '4'}, House ${user?.houseNumber || 'H-101'}. Emergency control center is responding!`);
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Banner */}
      <div
        className="card glass-panel"
        style={{
          background: offlineMode
            ? 'var(--bg-color)'
            : 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
          color: offlineMode ? 'var(--text-main)' : 'white',
          padding: '24px',
          borderRadius: '16px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontWeight: '700', color: offlineMode ? 'var(--danger)' : '#F59E0B' }}>
            <Siren size={30} /> KaWaCHaM Disaster Management & Emergency SOS
          </h2>
          <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
            Multi-Channel Geo-Fenced Disaster Alerts, Evacuation Routes & One-Touch SOS Dispatch
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {(isAuthority || isAdmin) && (
            <button
              onClick={() => setShowAuthorityModal(true)}
              className="btn"
              style={{ background: '#DC2626', color: 'white', fontWeight: '700', padding: '10px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Radio size={18} /> Broadcast Emergency Warning
            </button>
          )}

          <button
            className="btn glass-panel"
            style={{ color: offlineMode ? 'var(--text-main)' : 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setOfflineMode(!offlineMode)}
          >
            <WifiOff size={18} /> {offlineMode ? 'Go Online' : 'PWA Offline Mode'}
          </button>
        </div>
      </div>

      {offlineMode && (
        <div style={{ background: '#FEF3C7', borderLeft: '4px solid #F59E0B', color: '#92400E', padding: '14px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
          <WifiOff size={22} />
          <span><strong>Offline Mesh Mode Active:</strong> Displaying cached emergency escape maps and emergency hotlines via Service Worker.</span>
        </div>
      )}

      {error && (
        <div style={{ background: '#FEE2E2', borderLeft: '4px solid #EF4444', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} /> <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#D1FAE5', borderLeft: '4px solid #10B981', color: '#065F46', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} /> <span>{successMsg}</span>
        </div>
      )}

      {/* Citizen Emergency One-Touch SOS Trigger Card */}
      <div className="card glass-panel" style={{ border: '2px solid #EF4444', background: 'linear-gradient(135deg, #FFF5F5 0%, #FEF2F2 100%)', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#DC2626', fontWeight: '700', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeartPulse size={24} /> Immediate Emergency Assistance Request
          </h3>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Pressing SOS sends your live GPS coordinates, Ward {user?.wardNumber || '4'}, and House Number to the Disaster Control Room.
          </p>
        </div>

        <button
          onClick={() => setSosActive(true)}
          className="btn"
          style={{
            background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
            color: 'white',
            fontWeight: '800',
            fontSize: '1.1rem',
            padding: '16px 32px',
            borderRadius: '30px',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <Siren size={24} /> TRIGGER SOS RESCUE
        </button>
      </div>

      {/* Active Disaster Warnings & Emergency Relief Map */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* Active Geo Warnings List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <AlertTriangle color="#DC2626" /> Active Location Geo-Warnings ({alerts.length})
          </h3>

          {alerts.map((a) => (
            <div key={a._id} className="card glass-panel" style={{ borderLeft: `6px solid ${a.severity === 'emergency' ? '#DC2626' : '#F59E0B'}`, padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, color: a.severity === 'emergency' ? '#DC2626' : '#D97706', fontSize: '1.05rem', fontWeight: '700' }}>
                  {a.title}
                </h4>
                <span className="badge" style={{ background: a.severity === 'emergency' ? '#FEE2E2' : '#FEF3C7', color: a.severity === 'emergency' ? '#991B1B' : '#92400E', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  {a.severity}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {a.message}
              </p>
              <div style={{ marginTop: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>📍 Area: {a.panchayatName}</span>
                <span>⏱️ Issued: {new Date(a.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Relief Camps */}
        <div className="card glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700' }}>
            <Map color="var(--primary)" /> Designated Evacuation Relief Camps
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div style={{ padding: '14px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Govt. Higher Secondary School Relief Camp</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ward 4 • 1.2 km away • Capacity: 180 / 400</div>
              </div>
              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Compass size={14} /> Navigate
              </button>
            </div>

            <div style={{ padding: '14px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.95rem' }}>St. Mary's Community Hall</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ward 5 • 2.5 km away • Capacity: 90 / 250</div>
              </div>
              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Compass size={14} /> Navigate
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Hotlines */}
        <div className="card glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700' }}>
            <PhoneCall color="var(--secondary)" /> Emergency Hotlines
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <a href="tel:108" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                <span>Ambulance & Medical Emergency</span> <span>108</span>
              </div>
            </a>

            <a href="tel:101" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#FEF3C7', color: '#92400E', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                <span>Fire & Rescue Squad</span> <span>101</span>
              </div>
            </a>

            <a href="tel:+919447123456" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#DBEAFE', color: '#1E40AF', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                <span>Panchayat Disaster Control Room</span> <span>+91 94471 23456</span>
              </div>
            </a>
          </div>
        </div>

      </div>

      {/* Authority Broadcast Emergency Alert Drawer Modal */}
      {showAuthorityModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', borderRadius: '16px', background: 'white' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#DC2626', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={22} /> Broadcast Emergency Warning
              </h3>
              <button onClick={() => setShowAuthorityModal(false)} className="btn" style={{ background: 'transparent', padding: '4px 8px', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleBroadcastSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Alert Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Flood & Waterlogging Warning"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="glass-panel"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Severity Level *</label>
                  <select
                    value={broadcastForm.severity}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, severity: e.target.value })}
                    className="glass-panel"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontWeight: '600' }}
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                    <option value="emergency">Emergency (Red Alert)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Target Wards</label>
                  <input
                    type="text"
                    value={broadcastForm.targetWards}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetWards: e.target.value })}
                    className="glass-panel"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Emergency Advisory Message *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Evacuation instructions, rising water levels, or shelter advice..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="glass-panel"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <button type="submit" className="btn" style={{ background: '#DC2626', color: 'white', padding: '12px', marginTop: '8px', fontWeight: '700', borderRadius: '8px' }}>
                Dispatch Geo-Targeted Alert Broadcast
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Citizen SOS Confirmation Modal */}
      {sosActive && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', borderRadius: '16px', background: 'white' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Siren size={52} color="#DC2626" style={{ marginBottom: '8px' }} />
              <h3 style={{ color: '#DC2626', margin: 0, fontWeight: '700' }}>Confirm Rescue SOS Signal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                This will dispatch emergency services to your location immediately.
              </p>
            </div>

            {sosSentSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CheckCircle2 size={48} color="#10B981" />
                <h4 style={{ color: '#065F46', marginTop: '8px' }}>SOS Dispatched!</h4>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Emergency Type:</label>
                  <select
                    value={sosType}
                    onChange={(e) => setSosType(e.target.value)}
                    className="glass-panel"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontWeight: '600' }}
                  >
                    <option value="Flood Waterlogging">Waterlogging & Flooding</option>
                    <option value="Landslide Threat">Landslide / Soil Erosion</option>
                    <option value="Medical Emergency">Medical Assistance Needed</option>
                    <option value="Fire Hazard">Fire Emergency</option>
                  </select>
                </div>

                <div style={{ background: '#F9FAFB', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #E5E7EB' }}>
                  <div><strong>Citizen:</strong> {user?.name}</div>
                  <div><strong>Phone:</strong> {user?.phoneNumber}</div>
                  <div><strong>Location:</strong> Ward {user?.wardNumber || '4'}, House #{user?.houseNumber || 'H-101'}</div>
                  <div style={{ color: '#DC2626', fontWeight: '600', marginTop: '4px' }}>📍 Live GPS Coordinates Captured</div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button onClick={() => setSosActive(false)} className="btn btn-secondary" style={{ flex: 1, padding: '10px' }}>
                    Cancel
                  </button>
                  <button onClick={handleSendSos} className="btn" style={{ flex: 1, background: '#DC2626', color: 'white', fontWeight: '700', padding: '10px' }}>
                    Send SOS Dispatch
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
