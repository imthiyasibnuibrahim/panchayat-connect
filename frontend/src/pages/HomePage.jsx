import React, { useContext } from 'react';
import { Briefcase, ShoppingBag, Sprout, Siren, ShieldCheck, MapPin, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function HomePage() {
  const { user, isAdmin } = useContext(AuthContext);

  const stats = [
    { label: 'Active Geo Alerts', value: '1 Active', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
    { label: 'Harvest Pre-books', value: '145 kg', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
    { label: 'Open Local Jobs', value: '12 Vacancies', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
  ];

  const quickLinks = [
    ...(isAdmin
      ? [
          {
            title: 'Central Admin Governance',
            icon: <ShieldCheck size={26} color="#4338CA" />,
            path: '/admin',
            desc: 'User Directory, Role Reassignment & System Access Revocation',
            badge: 'Admin Exclusive',
            badgeClass: 'role-badge-admin',
          },
        ]
      : []),
    { 
      title: 'Kudumbashree Market', 
      icon: <ShoppingBag size={26} color="#0D9488" />, 
      path: '/market', 
      desc: 'Buy homemade products & list local seller items', 
      badge: 'Geo-Fenced', 
      badgeClass: 'badge-approved',
    },
    { 
      title: 'KaWaCHaM Disaster SOS', 
      icon: <Siren size={26} color="#DC2626" />, 
      path: '/disaster', 
      desc: 'Emergency warnings & one-touch rescue SOS dispatch', 
      badge: 'High Priority', 
      badgeClass: 'badge-emergency',
    },
    { 
      title: 'Smart Harvest D2C Grid', 
      icon: <Sprout size={26} color="#D97706" />, 
      path: '/agriculture', 
      desc: 'Direct farm-to-table pre-booking at guaranteed fair prices', 
      badge: 'Fresh Yield', 
      badgeClass: 'badge-pending',
    },
    { 
      title: 'Employment & MGNREGA', 
      icon: <Briefcase size={26} color="#047857" />, 
      path: '/employment', 
      desc: 'Local work allocations, skill passport & 100-day work portal', 
      badge: 'Work Portal', 
      badgeClass: 'badge-info',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 🌟 Modern Soft Hero Executive Banner */}
      <div className="modern-hero-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge badge-approved" style={{ marginBottom: '10px' }}>
              <Sparkles size={13} color="#047857" /> Smart Kerala Gram Panchayat
            </div>
            <h1 style={{ fontSize: '2.1rem', marginBottom: '6px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
              Welcome back, {user?.name || 'Citizen'}!
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} color="var(--primary-emerald)" />
              <span>Ward {user?.wardNumber || '4'}, House #{user?.houseNumber || 'H-101'} • {user?.panchayatName || 'Ward 4 Central Panchayat'}</span>
            </p>
          </div>

          {/* Profile Role Badge */}
          <div style={{ background: 'var(--canvas-bg)', padding: '10px 16px', borderRadius: '14px', border: '1px solid var(--border-divider)', textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', fontWeight: '700' }}>Verified Role</span>
            <span style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--primary-emerald)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <CheckCircle2 size={15} /> {user?.role || 'Citizen'}
            </span>
          </div>
        </div>

        {/* Dynamic Stats Row Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '24px' }}>
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="hero-stat-card"
            >
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: stat.color, letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

      </div>

      {/* Community Modules Header */}
      <div>
        <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🚀</span> Hyper-Local Community Modules
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '3px 0 0 0' }}>
          Select a government portal service below for direct Ward {user?.wardNumber || '4'} access
        </p>
      </div>

      {/* Modules Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {quickLinks.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            className="card card-hoverable"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              padding: '20px',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'var(--canvas-bg)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-divider)' }}>
                {link.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>{link.title}</h4>
                </div>
                <p style={{ margin: '4px 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>{link.desc}</p>
                {link.badge && (
                  <span className={`badge ${link.badgeClass}`}>
                    {link.badge}
                  </span>
                )}
              </div>
            </div>

            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--canvas-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-divider)' }}>
              <ChevronRight color="var(--text-muted)" size={18} />
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
