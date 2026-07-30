import React, { useState, useEffect, useContext } from 'react';
import { Sprout, Clock, CheckCircle, Plus, AlertCircle, CheckCircle2, ShoppingBag, MapPin } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function AgriculturePage() {
  const { user, isSeller, isAdmin } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [bookingQty, setBookingQty] = useState({});

  // Farmer Add Harvest Listing State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHarvest, setNewHarvest] = useState({
    title: '',
    targetQuantityKg: 100,
    pricePerUnit: 40,
    harvestDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    description: '',
  });

  const fetchHarvests = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`/api/v1/products/nearby?lng=76.2711&lat=10.8505&type=pre_harvest`);
      setProducts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch agricultural harvest grid');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvests();
  }, []);

  const handlePrebook = async (productId) => {
    try {
      setError('');
      setSuccessMsg('');
      const qty = parseInt(bookingQty[productId] || 1, 10);
      const res = await axios.post(`/api/v1/products/${productId}/pre-book`, { quantityKg: qty });
      setSuccessMsg(res.data.message || '🌾 Harvest pre-booked successfully! Farm pickup notice dispatched.');
      
      setProducts(products.map(p => 
        p._id === productId 
          ? { ...p, bookedQuantityKg: res.data.data.bookedQuantityKg, status: res.data.data.status } 
          : p
      ));
    } catch (err) {
      setError(err.response?.data?.error || 'Pre-booking failed');
    }
  };

  const handleCreateHarvestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await axios.post('/api/v1/products', {
        title: newHarvest.title,
        category: 'Fresh Produce',
        productType: 'pre_harvest',
        pricePerUnit: parseFloat(newHarvest.pricePerUnit),
        unit: 'kg',
        targetQuantityKg: parseInt(newHarvest.targetQuantityKg, 10),
        harvestDate: newHarvest.harvestDate,
        description: newHarvest.description,
      });
      setSuccessMsg(`✅ Upcoming harvest "${newHarvest.title}" published to Ward Harvest Grid!`);
      setShowAddModal(false);
      setNewHarvest({
        title: '',
        targetQuantityKg: 100,
        pricePerUnit: 40,
        harvestDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        description: '',
      });
      fetchHarvests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish harvest listing.');
    }
  };

  const handleQtyChange = (productId, qty) => {
    setBookingQty(prev => ({ ...prev, [productId]: qty }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div
        className="card glass-panel"
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
          color: 'white',
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
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontWeight: '700', color: '#34D399' }}>
            <Sprout size={32} /> Smart Harvest Direct-to-Consumer Agricultural Grid
          </h2>
          <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
            Zero-waste, farm-to-kitchen pre-booking. Direct fair prices for farmers and Ward {user?.wardNumber || '4'} households.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn"
            style={{ background: '#10B981', color: 'white', fontWeight: '700', padding: '10px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Post Upcoming Harvest
          </button>
        </div>
      </div>

      {/* Alert Messages */}
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

      {/* Harvest Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading local farm harvest schedules...</div>
      ) : products.length === 0 ? (
        <div className="card glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Sprout size={48} opacity={0.3} style={{ marginBottom: '12px' }} />
          <h3>No upcoming harvest listings found in your Panchayat.</h3>
          <p style={{ fontSize: '0.9rem' }}>Farmers can click "Post Upcoming Harvest" above to list fresh produce!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {products.map((p) => {
            const targetKg = p.targetQuantityKg || 100;
            const bookedKg = p.bookedQuantityKg || 0;
            const progress = Math.min(100, Math.round((bookedKg / targetKg) * 100));
            const isFullyBooked = p.status === 'fully_booked' || bookedKg >= targetKg;

            return (
              <div key={p._id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '14px', padding: '22px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '700' }}>{p.title}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> Ward {user?.wardNumber || '4'} Organic Farm
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#047857' }}>
                      ₹{p.pricePerUnit} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {p.unit || 'kg'}</span>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', background: '#FEF3C7', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                  <Clock size={16} />
                  <span>Harvesting Date: {new Date(p.harvestDate || Date.now() + 86400000).toLocaleDateString()}</span>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '14px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                    <span>Progress: {progress}%</span>
                    <span>{bookedKg} / {targetKg} kg Reserved</span>
                  </div>
                  <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: isFullyBooked ? '#10B981' : '#059669', transition: 'width 0.5s' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                  <input
                    type="number"
                    value={bookingQty[p._id] || 1}
                    min="1"
                    max={targetKg - bookedKg}
                    onChange={(e) => handleQtyChange(p._id, e.target.value)}
                    disabled={isFullyBooked}
                    className="glass-panel"
                    style={{ width: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', textAlign: 'center', fontWeight: '700' }}
                  />
                  <button
                    className={`btn ${isFullyBooked ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ flex: 1, padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: '600' }}
                    onClick={() => handlePrebook(p._id)}
                    disabled={isFullyBooked}
                  >
                    {isFullyBooked ? <><CheckCircle size={18} /> Fully Reserved</> : <><ShoppingBag size={18} /> Reserve Fresh Harvest</>}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Farmer Add Harvest Listing Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px', background: 'white' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: '700' }}>Post Upcoming Crop Harvest</h3>
              <button onClick={() => setShowAddModal(false)} className="btn" style={{ background: 'transparent', padding: '4px 8px', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleCreateHarvestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Crop Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Nendran Bananas"
                  value={newHarvest.title}
                  onChange={(e) => setNewHarvest({ ...newHarvest, title: e.target.value })}
                  className="glass-panel"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Target Quantity (kg) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newHarvest.targetQuantityKg}
                    onChange={(e) => setNewHarvest({ ...newHarvest, targetQuantityKg: e.target.value })}
                    className="glass-panel"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Price (₹/kg) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newHarvest.pricePerUnit}
                    onChange={(e) => setNewHarvest({ ...newHarvest, pricePerUnit: e.target.value })}
                    className="glass-panel"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Expected Harvest Date *</label>
                <input
                  type="date"
                  required
                  value={newHarvest.harvestDate}
                  onChange={(e) => setNewHarvest({ ...newHarvest, harvestDate: e.target.value })}
                  className="glass-panel"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Description / Organic Notes</label>
                <textarea
                  rows="3"
                  placeholder="Farming method, organic certification, or pickup location..."
                  value={newHarvest.description}
                  onChange={(e) => setNewHarvest({ ...newHarvest, description: e.target.value })}
                  className="glass-panel"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '10px', fontWeight: '600' }}>
                Publish to Harvest Pre-Booking Grid
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
