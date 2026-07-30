import React, { useState, useEffect, useContext } from 'react';
import { ShoppingBag, MapPin, Truck, Store, Plus, Filter, CheckCircle2, AlertCircle, PackageCheck, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function MarketplacePage() {
  const { user, isSeller, isAdmin } = useContext(AuthContext);

  const [radius, setRadius] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Seller Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: 'Kudumbashree',
    pricePerUnit: '',
    unit: 'packet',
    deliveryRadiusKm: 5,
    description: '',
  });

  // Order Placement Modal State
  const [selectedOrderProduct, setSelectedOrderProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [deliveryMode, setDeliveryMode] = useState('Home Delivery');
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);

  const categories = ['All', 'Kudumbashree', 'Organic Foods', 'Handicrafts', 'Home Care', 'Textiles'];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      // Using Ward 4 coordinates
      const res = await axios.get('/api/v1/products/nearby?lng=76.2711&lat=10.8505&type=standard');
      setProducts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch nearby marketplace products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await axios.post('/api/v1/products', {
        ...newProduct,
        pricePerUnit: parseFloat(newProduct.pricePerUnit),
        deliveryRadiusKm: parseInt(newProduct.deliveryRadiusKm, 10),
      });
      setSuccessMsg(`✅ Product "${newProduct.title}" created successfully!`);
      setShowAddModal(false);
      setNewProduct({
        title: '',
        category: 'Kudumbashree',
        pricePerUnit: '',
        unit: 'packet',
        deliveryRadiusKm: 5,
        description: '',
      });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product.');
    }
  };

  const handleConfirmOrder = () => {
    setOrderPlacedSuccess(true);
    setTimeout(() => {
      setOrderPlacedSuccess(false);
      setSelectedOrderProduct(null);
      setSuccessMsg(`🎉 Order placed successfully for ${selectedOrderProduct.title}! The Kudumbashree unit will contact you.`);
    }, 1500);
  };

  // Filter products by distance and category
  const filteredProducts = products.filter((p) => {
    const matchesDistance = (p.distanceKm || 0) <= radius;
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesDistance && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Modern Emerald Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
          color: 'white',
          padding: '18px 20px',
          borderRadius: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 14px rgba(6, 78, 59, 0.15)',
          border: 'none',
        }}
      >
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: '600', color: 'white', fontSize: '1.15rem' }}>
            <ShoppingBag size={22} /> Kudumbashree Micro-Enterprise Market
          </h2>
          <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.82rem', color: '#E2E8F0' }}>
            Direct-from-Women's Self Help Groups • Geo-fenced delivery for Ward {user?.wardNumber || '4'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {(isSeller || isAdmin) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', background: '#F59E0B', color: 'white', border: 'none', fontSize: '0.78rem', fontWeight: '600' }}
            >
              <Plus size={15} /> List Item
            </button>
          )}

          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.25)' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '2px', fontWeight: '500', color: '#F1F5F9' }}>
              Radius: <span style={{ color: '#FBBF24', fontWeight: '700' }}>{radius} km</span>
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value, 10))}
              style={{ width: '110px' }}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
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

      {/* Category Pills Filter */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', padding: '6px 12px' }}>
          <Filter size={16} /> Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="btn"
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              border: selectedCategory === cat ? 'none' : '1px solid #D1D5DB',
              background: selectedCategory === cat ? 'var(--primary)' : 'white',
              color: selectedCategory === cat ? 'white' : 'var(--text-main)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Searching nearby Kudumbashree units...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="card glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Store size={48} opacity={0.3} style={{ marginBottom: '12px' }} />
          <h3>No products found within {radius} km in category '{selectedCategory}'</h3>
          <p style={{ fontSize: '0.9rem' }}>Try expanding your distance slider or switching categories.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredProducts.map((p) => (
            <div key={p._id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '12px', padding: '20px' }}>
              
              <div style={{ height: '140px', background: 'linear-gradient(135deg, #ECFDF5 0%, #E0F2FE 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Store size={52} color="#059669" opacity={0.7} />
                <span className="badge" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', color: '#065F46', fontWeight: '700', fontSize: '0.75rem' }}>
                  Kudumbashree Verified
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{p.title}</h3>
                  <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
                    ₹{p.pricePerUnit} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {p.unit}</span>
                  </span>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description || 'Authentic home-prepared product by local Kudumbashree neighborhood group.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#D1FAE5', color: '#065F46' }}>
                  <MapPin size={12} /> {p.distanceKm || 0.8} km away
                </span>
                <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#DBEAFE', color: '#1E40AF' }}>
                  <Truck size={12} /> Delivery in {p.deliveryRadiusKm || 5} km
                </span>
              </div>

              <button
                className="btn btn-primary"
                style={{ marginTop: 'auto', width: '100%', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: '600' }}
                onClick={() => {
                  setSelectedOrderProduct(p);
                  setOrderQuantity(1);
                }}
              >
                <ShoppingCart size={16} /> Order Local Product
              </button>

            </div>
          ))}
        </div>
      )}

      {/* Seller Add Product Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '28px', borderRadius: '16px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: '700' }}>List Kudumbashree Item</h3>
              <button onClick={() => setShowAddModal(false)} className="btn" style={{ background: 'transparent', padding: '4px 8px', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Jackfruit Chips"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="glass-panel"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="glass-panel"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  >
                    <option value="Kudumbashree">Kudumbashree</option>
                    <option value="Organic Foods">Organic Foods</option>
                    <option value="Handicrafts">Handicrafts</option>
                    <option value="Home Care">Home Care</option>
                    <option value="Textiles">Textiles</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="80"
                    value={newProduct.pricePerUnit}
                    onChange={(e) => setNewProduct({ ...newProduct, pricePerUnit: e.target.value })}
                    className="glass-panel"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Unit Type</label>
                  <input
                    type="text"
                    placeholder="packet / kg / bottle"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="glass-panel"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Delivery Radius (km)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newProduct.deliveryRadiusKm}
                    onChange={(e) => setNewProduct({ ...newProduct, deliveryRadiusKm: e.target.value })}
                    className="glass-panel"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe preparation, ingredients, or Kudumbashree unit info..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="glass-panel"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '10px', fontWeight: '600' }}>
                Post Product to Ward Marketplace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Citizen Order Placement Modal */}
      {selectedOrderProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '28px', borderRadius: '16px', background: 'white' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: '700' }}>Order Confirmation</h3>
              <button onClick={() => setSelectedOrderProduct(null)} className="btn" style={{ background: 'transparent', padding: '4px 8px', fontSize: '1.2rem' }}>✕</button>
            </div>

            {orderPlacedSuccess ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <PackageCheck size={56} color="#10B981" style={{ marginBottom: '12px' }} />
                <h3 style={{ color: '#065F46', marginBottom: '8px' }}>Order Placed!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Notifying local Kudumbashree unit for Ward delivery...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '14px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{selectedOrderProduct.title}</div>
                  <div style={{ color: 'var(--primary)', fontWeight: '700', marginTop: '4px' }}>
                    ₹{selectedOrderProduct.pricePerUnit} per {selectedOrderProduct.unit}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Select Quantity:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                      style={{ padding: '6px 12px' }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem', width: '24px', textAlign: 'center' }}>{orderQuantity}</span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setOrderQuantity(orderQuantity + 1)}
                      style={{ padding: '6px 12px' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>Delivery Address (Verified Profile):</span>
                  <div style={{ background: '#F9FAFB', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.85rem' }}>
                    <div><strong>{user?.name}</strong> (+91{user?.phoneNumber?.replace('+91', '')})</div>
                    <div style={{ color: 'var(--text-muted)' }}>Ward {user?.wardNumber || '4'}, House #{user?.houseNumber || 'H-101'}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{user?.panchayatName || 'Panchayat Central'}</div>
                  </div>
                </div>

                <div>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>Fulfillment Method:</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setDeliveryMode('Home Delivery')}
                      className="btn"
                      style={{ flex: 1, padding: '8px', border: deliveryMode === 'Home Delivery' ? '2px solid var(--primary)' : '1px solid #D1D5DB', background: deliveryMode === 'Home Delivery' ? '#EFF6FF' : 'white', fontSize: '0.85rem', fontWeight: '600' }}
                    >
                      🛵 Ward Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMode('Center Pickup')}
                      className="btn"
                      style={{ flex: 1, padding: '8px', border: deliveryMode === 'Center Pickup' ? '2px solid var(--primary)' : '1px solid #D1D5DB', background: deliveryMode === 'Center Pickup' ? '#EFF6FF' : 'white', fontSize: '0.85rem', fontWeight: '600' }}
                    >
                      🏬 Center Pickup
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600' }}>Total Amount:</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary)' }}>
                    ₹{selectedOrderProduct.pricePerUnit * orderQuantity}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontWeight: '600', borderRadius: '8px' }}
                >
                  Confirm Order & Contact Seller
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
