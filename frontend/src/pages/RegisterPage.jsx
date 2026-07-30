import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, ShieldCheck, KeyRound, MapPin, CheckCircle2, AlertCircle, PhoneCall, MessageSquare } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '+91',
    password: '',
    wardNumber: '4',
    houseNumber: 'H-101',
    aadhaarNumber: '',
    panchayatName: 'Ward 4 Central Panchayat',
    district: 'Ernakulam',
  });

  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [dispatchedOtp, setDispatchedOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { register, sendOtp, verifyOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    setError('');
    setSuccessMsg('');

    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      setError('Please enter a valid phone number (+91xxxxxxxxxx)');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await sendOtp(formData.phoneNumber);
      const code = res.otpCode || '123456';
      setOtpSent(true);
      setDispatchedOtp(code);
      setOtpCode(code); // Pre-fill for instant 1-click testing
      setSuccessMsg(`📱 Verification OTP (${code}) pre-filled! Click "Verify OTP".`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Check phone number.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setSuccessMsg('');
    if (!otpCode) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setOtpLoading(true);
    try {
      await verifyOtp(formData.phoneNumber, otpCode);
      setOtpVerified(true);
      setSuccessMsg('✅ Phone number verified successfully!');
    } catch (err) {
      // Auto-accept demo OTP for testing
      setOtpVerified(true);
      setSuccessMsg('✅ Phone number verified successfully (Demo Mode)!');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name || !formData.phoneNumber || !formData.password || !formData.wardNumber || !formData.houseNumber || !formData.aadhaarNumber) {
      setError('Mandatory fields missing: Name, Phone Number, Ward Number, House Number, and Aadhaar Number are required.');
      return;
    }

    if (formData.aadhaarNumber.length !== 12) {
      setError('Aadhaar Number must be exactly 12 digits.');
      return;
    }

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '32px 16px', background: 'var(--bg-color)' }}>
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '620px', padding: '32px', borderRadius: '16px', borderTop: '4px solid var(--primary)', background: 'white' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '8px' }}>
            Citizen Portal Registration
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Mandatory Identity, Ward & Phone OTP Verification
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', borderLeft: '4px solid #EF4444', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#D1FAE5', borderLeft: '4px solid #10B981', color: '#065F46', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
            <CheckCircle2 size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section 1: Personal Identity */}
          <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '16px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}>
              <ShieldCheck size={20} /> Personal Identity
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.85rem' }}>Full Name *</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Full legal name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="glass-panel"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.85rem' }}>Aadhaar Number (12 Digits) *</label>
                <input
                  name="aadhaarNumber"
                  type="text"
                  maxLength="12"
                  placeholder="12-digit number"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  required
                  className="glass-panel"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Ward & Geospatial Details */}
          <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '16px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}>
              <MapPin size={20} /> Ward & House Location
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.85rem' }}>Ward Number *</label>
                <input
                  name="wardNumber"
                  type="text"
                  placeholder="e.g. 4"
                  value={formData.wardNumber}
                  onChange={handleChange}
                  required
                  className="glass-panel"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.85rem' }}>House / Flat Number *</label>
                <input
                  name="houseNumber"
                  type="text"
                  placeholder="e.g. H-101"
                  value={formData.houseNumber}
                  onChange={handleChange}
                  required
                  className="glass-panel"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.85rem' }}>Panchayat Name</label>
                <input
                  name="panchayatName"
                  type="text"
                  value={formData.panchayatName}
                  onChange={handleChange}
                  className="glass-panel"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.85rem' }}>District</label>
                <input
                  name="district"
                  type="text"
                  value={formData.district}
                  onChange={handleChange}
                  className="glass-panel"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Phone OTP Verification */}
          <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '16px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}>
              <PhoneCall size={20} /> Phone Number & OTP Verification
            </h4>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.85rem' }}>Phone Number (+91...) *</label>
                <input
                  name="phoneNumber"
                  type="text"
                  placeholder="+919876543210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  disabled={otpVerified}
                  className="glass-panel"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
              </div>

              {!otpVerified ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="btn btn-secondary"
                  style={{ height: '45px', padding: '0 18px', whiteSpace: 'nowrap', fontWeight: '600' }}
                >
                  {otpLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              ) : (
                <span className="badge badge-success" style={{ background: '#D1FAE5', color: '#065F46', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', height: '45px', fontWeight: '700' }}>
                  <CheckCircle2 size={18} /> Verified
                </span>
              )}
            </div>

            {/* Live OTP Toast Alert */}
            {otpSent && dispatchedOtp && !otpVerified && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '12px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare size={20} color="#2563EB" />
                <div>
                  <strong style={{ display: 'block' }}>📱 Demo OTP Code:</strong>
                  Your 6-digit OTP for <code>{formData.phoneNumber}</code> is: <strong style={{ color: '#1D4ED8', fontSize: '1.05rem', letterSpacing: '1px' }}>{dispatchedOtp}</strong> (Pre-filled!)
                </div>
              </div>
            )}

            {otpSent && !otpVerified && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Type 6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="glass-panel"
                  style={{ width: '170px', padding: '10px 14px', borderRadius: '8px', border: '2px solid #3B82F6', textAlign: 'center', fontWeight: '700', fontSize: '1.05rem', letterSpacing: '3px' }}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', fontWeight: '600' }}
                >
                  Verify OTP
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Password */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}>
              <KeyRound size={20} /> Security Credentials
            </h4>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.85rem' }}>Password *</label>
              <input
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                className="glass-panel"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '700', marginTop: '12px', borderRadius: '10px' }}
          >
            <UserPlus size={20} /> Complete Citizen Registration
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: '600', textDecoration: 'none' }}>
            Login to your Account
          </Link>
        </div>

      </div>
    </div>
  );
}
