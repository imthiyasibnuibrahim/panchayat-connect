import React, { useContext } from 'react';
import { Briefcase, ShoppingBag, Sprout, Siren, FileText, ChevronRight, ShieldCheck, MapPin, User, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function HomePage() {
  const { user, isAdmin } = useContext(AuthContext);

  const stats = [
    { label: 'Active Geo Alerts', value: '1 Active', color: '#EF4444' },
    { label: 'Harvest Pre-books', value: '145 kg', color: '#10B981' },
    { label: 'Open Local Jobs', value: '12 Vacancies', color: '#3B82F6' },
  ];

  const quickLinks = [
    ...(isAdmin
      ? [
          {
            title: 'Central Admin Control Center',
            icon: <ShieldCheck size={26} color="#DC2626" />,
            path: '/admin',
            desc: 'User Directory, Role Reassignment & Access Revocation',
            badge: 'Admin Exclusive',
            badgeBg: '#FEE2E2',
            badgeColor: '#991B1B',
          },
        ]
      : []),
    { title: 'Kudumbashree Market', icon: <ShoppingBag size={26} color="#059669" />, path: '/market', desc: 'Buy homemade products & list seller items', badge: 'Geo-Fenced', badgeBg: '#D1FAE5', badgeColor: '#065F46' },
    { title: 'KaWaCHaM Disaster SOS', icon: <Siren size={26} color="#DC2626" />, path: '/disaster', desc: 'Emergency warnings & one-touch rescue SOS', badge: 'High Priority', badgeBg: '#FEE2E2', badgeColor: '#991B1B' },
    { title: 'Smart Harvest D2C Grid', icon: <Sprout size={26} color="#D97706" />, path: '/agriculture', desc: 'Direct farm-to-table pre-booking at fair prices', badge: 'Fresh Yield', badgeBg: '#FEF3C7', badgeColor: '#92400E' },
    { title: 'Employment & MGNREGA', icon: <Briefcase size={26} color="#2563EB" />, path: '/employment', desc: 'Local work allocations & skill exchange', badge: 'Work Portal', badgeBg: '#DBEAFE', badgeColor: '#1E40AF' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Hero Welcome Banner */}
      <div className="card glass-panel" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)', color: 'white', padding: '32px', borderRadius: '16px', borderLeft: '6px solid var(--accent)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '8px', fontWeight: '800' }}>
              Welcome, {user?.name || 'Citizen'}!
            </h2>
            <p style={{ fontSize: '1.05rem', opacity: 0.9, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#60A5FA" />
              <span>Ward {user?.wardNumber || '4'}, House #{user?.houseNumber || 'H-101'} • {user?.panchayatName || 'Ward 4 Central Panchayat'}</span>
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8, display: 'block' }}>Verified Role</span>
            <span style={{ fontWeight: '700', fontSize: '1rem', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <CheckCircle2 size={16} /> {user?.role || 'Citizen'}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '28px' }}>
          {stats.map((stat, i) => (
            <div key={i} className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

      </div>

      {/* Modules Section */}
      <h3 style={{ fontSize: '1.4rem', margin: '8px 0 0 0', fontWeight: '700', color: 'var(--primary)' }}>
        🚀 Hyper-Local Community Modules
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {quickLinks.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            className="card glass-panel"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              padding: '22px',
              borderRadius: '14px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {link.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>{link.title}</h4>
                </div>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{link.desc}</p>
                {link.badge && (
                  <span className="badge" style={{ marginTop: '8px', display: 'inline-block', background: link.badgeBg, color: link.badgeColor, fontSize: '0.75rem', fontWeight: '700' }}>
                    {link.badge}
                  </span>
                )}
              </div>
            </div>

            <ChevronRight color="var(--text-muted)" size={22} />
          </Link>
        ))}
      </div>

    </div>
  );
}
