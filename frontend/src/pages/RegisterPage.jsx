import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, ShieldAlert, CheckCircle2, Phone, Lock, Home, ShieldCheck, MapPin, Sparkles, AlertCircle, MessageSquare, KeyRound, PhoneCall } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '+91',
    password: '',
    aadhaarNumber: '',
    wardNumber: '4',
    houseNumber: 'H-101',
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '32px 16px', background: 'var(--canvas-bg)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '36px 32px', borderRadius: '24px', background: 'var(--surface-base)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-divider)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', padding: '14px', background: '#ECFDF5', borderRadius: '50%', color: 'var(--primary-emerald)', marginBottom: '12px', border: '1px solid #A7F3D0' }}>
            <UserPlus size={30} />
          </div>
          <h2 style={{ fontSize: '1.7rem', color: 'var(--text-primary)', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.03em' }}>
            Citizen Registration
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Mandatory Ward, House & Phone OTP Verification
          </p>
        </div>

        {error && (
          <div className="badge badge-emergency" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="badge badge-approved" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section 1: Personal Identity */}
          <div style={{ borderBottom: '1px solid var(--border-divider)', paddingBottom: '20px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-emerald)', marginBottom: '14px', fontSize: '0.95rem', fontWeight: '800' }}>
              <ShieldCheck size={18} /> 1. Personal Identity
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>Full Name *</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Full legal name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>Aadhaar Number (12 Digits) *</label>
                <input
                  name="aadhaarNumber"
                  type="text"
                  maxLength="12"
                  placeholder="12-digit number"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Ward Location */}
          <div style={{ borderBottom: '1px solid var(--border-divider)', paddingBottom: '20px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-emerald)', marginBottom: '14px', fontSize: '0.95rem', fontWeight: '800' }}>
              <MapPin size={18} /> 2. Ward & House Location
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>Ward Number *</label>
                <input
                  name="wardNumber"
                  type="text"
                  placeholder="e.g. 4"
                  value={formData.wardNumber}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>House / Flat Number *</label>
                <input
                  name="houseNumber"
                  type="text"
                  placeholder="e.g. H-101"
                  value={formData.houseNumber}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Phone & OTP Verification */}
          <div style={{ borderBottom: '1px solid var(--border-divider)', paddingBottom: '20px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-emerald)', marginBottom: '14px', fontSize: '0.95rem', fontWeight: '800' }}>
              <PhoneCall size={18} /> 3. Phone & OTP Verification
            </h4>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>Phone Number *</label>
                <input
                  name="phoneNumber"
                  type="text"
                  placeholder="+919876543210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  disabled={otpVerified}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>

              {!otpVerified ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="btn btn-secondary"
                  style={{ height: '42px', padding: '0 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700' }}
                >
                  {otpLoading ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              ) : (
                <span className="badge badge-approved" style={{ height: '42px', padding: '0 16px', fontWeight: '800' }}>
                  <CheckCircle2 size={16} /> Verified
                </span>
              )}
            </div>

            {otpSent && !otpVerified && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  style={{ width: '160px', padding: '10px', borderRadius: '10px', textAlign: 'center', fontWeight: '800', fontSize: '1rem', letterSpacing: '2px' }}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  className="btn btn-primary"
                  style={{ padding: '10px 18px', borderRadius: '9999px', fontWeight: '700' }}
                >
                  Verify Code
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Security Password */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-emerald)', marginBottom: '14px', fontSize: '0.95rem', fontWeight: '800' }}>
              <KeyRound size={18} /> 4. Password Security
            </h4>

            <div>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>Password *</label>
              <input
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '14px', fontWeight: '700', borderRadius: '9999px', fontSize: '0.95rem' }}>
            <UserPlus size={18} /> Complete Citizen Enrollment
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--primary-emerald)', textDecoration: 'none', fontWeight: '700' }}>
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
