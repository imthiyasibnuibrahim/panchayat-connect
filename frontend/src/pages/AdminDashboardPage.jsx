import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, UserCheck, UserX, UserPlus, Search, Filter, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create User Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    phoneNumber: '+91',
    password: 'password123',
    role: 'Citizen',
    aadhaarNumber: '',
    wardNumber: '4',
    houseNumber: '',
    panchayatName: 'Ward 4 Central Panchayat',
    district: 'Ernakulam',
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await axios.get('/api/v1/users', { params });
      setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    setError('');
    setSuccessMsg('');
    try {
      const res = await axios.patch(`/api/v1/users/${userId}/role`, { role: newRole });
      setSuccessMsg(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user role.');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    setError('');
    setSuccessMsg('');
    const nextStatus = currentStatus === 'Revoked' ? 'Active' : 'Revoked';
    try {
      const res = await axios.patch(`/api/v1/users/${userId}/status`, { status: nextStatus });
      setSuccessMsg(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user status.');
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await axios.post('/api/v1/users', newUser);
      setSuccessMsg(res.data.message);
      setShowCreateModal(false);
      setNewUser({
        name: '',
        phoneNumber: '+91',
        password: 'password123',
        role: 'Citizen',
        aadhaarNumber: '',
        wardNumber: '4',
        houseNumber: '',
        panchayatName: 'Ward 4 Central Panchayat',
        district: 'Ernakulam',
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user account.');
    }
  };

  // Stats calculation
  const totalUsers = users.length;
  const sellerCount = users.filter((u) => u.role === 'Seller').length;
  const authorityCount = users.filter((u) => u.role === 'Authority').length;
  const revokedCount = users.filter((u) => u.status === 'Revoked').length;

  return (
    <div style={{ padding: '0 12px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={32} color="#DC2626" /> Central RBAC Admin Portal
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Governance Hub for User Registration, Role Assignment & System Access Revocation
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '10px' }}
        >
          <UserPlus size={18} /> Provision New Account
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ background: '#FEE2E2', borderLeft: '4px solid #EF4444', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#D1FAE5', borderLeft: '4px solid #10B981', color: '#065F46', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card glass-panel" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Accounts</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', marginTop: '4px' }}>{totalUsers}</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10B981' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Kudumbashree Sellers</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669', marginTop: '4px' }}>{sellerCount}</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Panchayat Authorities</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563EB', marginTop: '4px' }}>{authorityCount}</div>
        </div>

        <div className="card glass-panel" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #EF4444' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Access Revoked</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#DC2626', marginTop: '4px' }}>{revokedCount}</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search Name, Phone, Aadhaar, Ward..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-panel"
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>Search</button>
        </form>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="glass-panel"
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            >
              <option value="">All Roles</option>
              <option value="Citizen">Citizen</option>
              <option value="Seller">Seller (Kudumbashree)</option>
              <option value="Authority">Authority</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-panel"
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Revoked">Revoked</option>
            </select>
          </div>

          <button onClick={fetchUsers} className="btn btn-secondary" style={{ padding: '8px' }} title="Refresh Directory">
            <RefreshCw size={18} />
          </button>
        </div>

      </div>

      {/* Users Directory Table */}
      <div className="card glass-panel" style={{ borderRadius: '12px', overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading User Directory...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No accounts found matching filter criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.04)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                  <th style={{ padding: '14px 18px' }}>User Details</th>
                  <th style={{ padding: '14px 18px' }}>Phone / Aadhaar</th>
                  <th style={{ padding: '14px 18px' }}>Ward & House</th>
                  <th style={{ padding: '14px 18px' }}>Assigned Role (RBAC)</th>
                  <th style={{ padding: '14px 18px' }}>Access Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isRevoked = u.status === 'Revoked';
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: isRevoked ? 'rgba(239, 68, 68, 0.04)' : 'transparent' }}>
                      
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.panchayatName || 'Ward 4'}</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div>{u.phoneNumber}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aadhaar: {u.aadhaarNumber || 'N/A'}</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div>Ward {u.wardNumber || '-'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>House: {u.houseNumber || '-'}</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="glass-panel"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            border: '1px solid #D1D5DB',
                            background: u.role === 'Admin' ? '#FEE2E2' : u.role === 'Seller' ? '#D1FAE5' : u.role === 'Authority' ? '#DBEAFE' : 'white',
                            color: u.role === 'Admin' ? '#991B1B' : u.role === 'Seller' ? '#065F46' : u.role === 'Authority' ? '#1E40AF' : '#1F2937',
                          }}
                        >
                          <option value="Citizen">Citizen</option>
                          <option value="Seller">Seller (Kudumbashree)</option>
                          <option value="Authority">Authority</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span className={`badge ${isRevoked ? 'badge-danger' : 'badge-success'}`} style={{ padding: '6px 12px', borderRadius: '12px' }}>
                          {isRevoked ? '⛔ Revoked' : '✓ Active'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleStatusToggle(u._id, u.status)}
                          className={`btn ${isRevoked ? 'btn-success' : 'btn-danger'}`}
                          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          {isRevoked ? <UserCheck size={14} /> : <UserX size={14} />}
                          {isRevoked ? 'Restore Access' : 'Revoke Access'}
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Provision Account Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', borderRadius: '16px', background: 'white' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}>Provision Specialized Account</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn" style={{ background: 'transparent', padding: '4px 8px', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Full Name *</label>
                <input type="text" required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="glass-panel" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Phone Number *</label>
                  <input type="text" required value={newUser.phoneNumber} onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })} className="glass-panel" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Aadhaar (12 Digits) *</label>
                  <input type="text" required maxLength="12" value={newUser.aadhaarNumber} onChange={(e) => setNewUser({ ...newUser, aadhaarNumber: e.target.value })} className="glass-panel" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Ward Number *</label>
                  <input type="text" required value={newUser.wardNumber} onChange={(e) => setNewUser({ ...newUser, wardNumber: e.target.value })} className="glass-panel" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>House Number *</label>
                  <input type="text" required value={newUser.houseNumber} onChange={(e) => setNewUser({ ...newUser, houseNumber: e.target.value })} className="glass-panel" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Assign Initial Role *</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="glass-panel" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontWeight: '600' }}>
                  <option value="Citizen">Citizen</option>
                  <option value="Seller">Seller (Kudumbashree Unit)</option>
                  <option value="Authority">Panchayat Authority</option>
                  <option value="Admin">Central Admin</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Initial Password *</label>
                <input type="password" required value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="glass-panel" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '10px', fontWeight: '600' }}>
                Provision Account
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
