import React, { useState, useEffect, useContext } from 'react';
import { Sprout, Calendar, Clock, ShoppingBag, Plus, MapPin, CheckCircle, AlertCircle, CheckCircle2, User, PhoneCall, Sparkles } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function AgriculturePage() {
  const { user, isSeller, isAdmin } = useContext(AuthContext);

  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-Book Modal state
  const [selectedHarvest, setSelectedHarvest] = useState(null);
  const [quantityKg, setQuantityKg] = useState('5');
  const [buyerPhone, setBuyerPhone] = useState(user?.phoneNumber || '+919876543210');

  // Post Crop Modal state (Farmer/Admin)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCrop, setNewCrop] = useState({
    cropName: 'Organic Nendran Bananas',
    expectedQuantityKg: '500',
    expectedPricePerKg: '45',
    harvestDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
    description: '',
  });

  const fetchHarvests = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/api/v1/harvests');
      setHarvests(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch harvest pre-orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvests();
  }, []);

  const handlePreBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHarvest) return;
    setError('');
    setSuccessMsg('');

    try {
      await axios.post(`/api/v1/harvests/${selectedHarvest._id}/prebook`, {
        quantityKg: Number(quantityKg),
        buyerName: user?.name || 'Verified Citizen',
        buyerPhone: buyerPhone,
      });

      setSuccessMsg(`🌱 Successfully pre-booked ${quantityKg} kg of "${selectedHarvest.cropName}"! Farmer will contact you on harvest day.`);
      setSelectedHarvest(null);
      fetchHarvests();
    } catch (err) {
      setError(err.response?.data?.error || 'Pre-booking failed.');
    }
  };

  const handleCreateCropSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      await axios.post('/api/v1/harvests', {
        ...newCrop,
        farmerName: user?.name || 'Ward Farmer',
        farmerPhone: user?.phoneNumber || '+919876543210',
        wardNumber: user?.wardNumber || '4',
      });

      setSuccessMsg(`🎉 Harvest pre-booking post for "${newCrop.cropName}" created successfully!`);
      setShowAddModal(false);
      fetchHarvests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post crop pre-booking.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 🌾 Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #B45309 0%, #D97706 60%, #047857 100%)',
          color: 'white',
          padding: '28px 32px',
          borderRadius: '24px',
          boxShadow: '0 8px 24px rgba(217, 119, 6, 0.25)',
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
            <Sprout size={14} color="#FCD34D" /> Smart Farm-to-Table Pre-Orders
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>
            Direct Farm-to-Table Harvest Grid
          </h2>
          <p style={{ margin: '4px 0 0 0', opacity: 0.95, fontSize: '0.9rem', color: '#FEF3C7' }}>
            Ward {user?.wardNumber || '4'} Pre-Book Organic Yield Direct from Local Farmers at Guaranteed Fair Prices
          </p>
        </div>

        {(isSeller || isAdmin) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn"
            style={{ padding: '10px 20px', borderRadius: '9999px', background: '#047857', color: 'white', fontWeight: '700', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Post Upcoming Harvest
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="badge badge-emergency" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="badge badge-approved" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> <span>{successMsg}</span>
        </div>
      )}

      {/* Harvest Cards Grid */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading harvest pre-orders...</div>
      ) : harvests.length === 0 ? (
        <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Sprout size={40} opacity={0.3} style={{ marginBottom: '8px' }} />
          <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>No active upcoming harvests in Ward {user?.wardNumber || '4'}</h4>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {harvests.map((harvest) => {
            const prebooked = harvest.prebookedQuantityKg || 0;
            const total = Number(harvest.expectedQuantityKg) || 100;
            const progress = Math.min(100, Math.round((prebooked / total) * 100));

            return (
              <div key={harvest._id} className="card card-hoverable" style={{ borderRadius: '20px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <span className="badge badge-pending" style={{ marginBottom: '6px' }}>
                      🌾 Harvest in {Math.ceil((new Date(harvest.harvestDate) - new Date()) / 86400000)} days
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '800' }}>{harvest.cropName}</h3>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--secondary-amber)' }}>₹{harvest.expectedPricePerKg}</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>per kg</span>
                  </div>
                </div>

                {/* Pre-order Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    <span>Pre-Booked: {prebooked} / {total} kg</span>
                    <span>{progress}% Claimed</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: 'var(--canvas-bg)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid var(--border-divider)' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--secondary-amber)', borderRadius: '9999px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={14} color="var(--primary-emerald)" /> Farmer: {harvest.farmerName || 'Local Farmer'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} color="#D97706" /> {new Date(harvest.harvestDate).toLocaleDateString()}
                  </span>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ marginTop: 'auto', width: '100%', padding: '12px', fontWeight: '700', borderRadius: '9999px' }}
                  onClick={() => setSelectedHarvest(harvest)}
                >
                  🌾 Pre-Book Harvest Yield
                </button>

              </div>
            );
          })}
        </div>
      )}

      {/* Citizen Pre-Book Modal */}
      {selectedHarvest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '28px', borderRadius: '24px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-emerald)', fontWeight: '800', fontSize: '1.15rem' }}>Pre-Book Farm Harvest</h3>
              <button onClick={() => setSelectedHarvest(null)} className="btn" style={{ background: 'transparent', padding: '4px', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handlePreBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#FFFBEB', padding: '12px 16px', borderRadius: '14px', border: '1px solid #FCD34D' }}>
                <strong style={{ color: '#B45309', display: 'block', fontSize: '0.95rem' }}>{selectedHarvest.cropName}</strong>
                <span style={{ fontSize: '0.8rem', color: '#92400E' }}>Guaranteed Rate: ₹{selectedHarvest.expectedPricePerKg} / kg</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Select Quantity (kg) *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                <span>Total Estimated Cost:</span>
                <span style={{ color: 'var(--primary-emerald)' }}>₹{(Number(quantityKg) || 0) * Number(selectedHarvest.expectedPricePerKg)}</span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '14px', fontWeight: '800', borderRadius: '9999px' }}>
                Confirm Pre-Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Post Harvest Modal (Farmers & Admins) */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '28px', borderRadius: '24px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--secondary-amber)', fontWeight: '800', fontSize: '1.15rem' }}>Post Upcoming Harvest</h3>
              <button onClick={() => setShowAddModal(false)} className="btn" style={{ background: 'transparent', padding: '4px', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleCreateCropSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Crop / Produce Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Nendran Bananas"
                  value={newCrop.cropName}
                  onChange={(e) => setNewCrop({ ...newCrop, cropName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Expected Yield (kg) *</label>
                  <input
                    type="number"
                    required
                    value={newCrop.expectedQuantityKg}
                    onChange={(e) => setNewCrop({ ...newCrop, expectedQuantityKg: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Fair Rate (₹ / kg) *</label>
                  <input
                    type="number"
                    required
                    value={newCrop.expectedPricePerKg}
                    onChange={(e) => setNewCrop({ ...newCrop, expectedPricePerKg: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Expected Harvest Date *</label>
                <input
                  type="date"
                  required
                  value={newCrop.harvestDate}
                  onChange={(e) => setNewCrop({ ...newCrop, harvestDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>

              <button type="submit" className="btn btn-secondary" style={{ padding: '14px', marginTop: '6px', fontWeight: '800', borderRadius: '9999px' }}>
                Publish Pre-Booking Listing
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
