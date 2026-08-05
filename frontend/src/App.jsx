import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Home, Briefcase, ShoppingBag, Sprout, Siren, Menu, X, LogOut, User as UserIcon, ShieldCheck, ShieldAlert, Landmark, Smartphone, Sparkles, CloudSun
} from 'lucide-react';

import { AuthProvider, AuthContext } from './context/AuthContext';
import RoleRoute from './components/RoleRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import EmploymentPage from './pages/EmploymentPage';
import MarketplacePage from './pages/MarketplacePage';
import AgriculturePage from './pages/AgriculturePage';
import DisasterPage from './pages/DisasterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', color: 'var(--primary-emerald)' }}>
        <div className="animate-pulse" style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🌴</span> Loading Smart Kerala Gram Panchayat Portal...
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

function Layout({ children }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const location = useLocation();
  const { user, logout, isAdmin } = useContext(AuthContext);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) {
      alert('PWA Installation: Open this link in Chrome/Safari on your mobile phone and tap "Add to Home Screen"!');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!user) return <>{children}</>;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="badge role-badge-admin" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
            <ShieldAlert size={12} color="#4338CA" /> Admin
          </span>
        );
      case 'Seller':
      case 'Farmer':
        return (
          <span className="badge role-badge-farmer" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
            <Sprout size={12} color="#B45309" /> Farmer
          </span>
        );
      case 'Authority':
        return (
          <span className="badge role-badge-employee" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
            <Landmark size={12} color="#1E293B" /> Official
          </span>
        );
      default:
        return (
          <span className="badge role-badge-citizen" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
            <UserIcon size={12} color="#047857" /> Citizen
          </span>
        );
    }
  };

  const displayName = user?.name && typeof user.name === 'string' ? user.name.split(' ')[0] : 'Citizen';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={16} /> },
    ...(isAdmin ? [{ name: 'Admin', path: '/admin', icon: <ShieldCheck size={16} color="#DC2626" /> }] : []),
    { name: 'Marketplace', path: '/market', icon: <ShoppingBag size={16} /> },
    { name: 'Harvest D2C', path: '/agriculture', icon: <Sprout size={16} /> },
    { name: 'Employment', path: '/employment', icon: <Briefcase size={16} /> },
    { name: 'Disaster SOS', path: '/disaster', icon: <Siren size={16} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--canvas-bg)', display: 'flex', flexDirection: 'column' }}>
      
      {/* 🌟 Modern Clean Top Header Navigation */}
      <header 
        style={{ 
          background: '#FFFFFF', 
          borderBottom: '1px solid var(--border-divider)',
          position: 'sticky', 
          top: 0, 
          zIndex: 60, 
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand Logo & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--primary-emerald)', color: 'white', width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '800' }}>
                🌴
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '800', letterSpacing: '-0.02em' }}>
                  Panchayat Connect
                </h1>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'block', marginTop: '-2px' }}>
                  Smart Kerala Gram Portal
                </span>
              </div>
            </Link>

            {/* Desktop Horizontal Navigation Links */}
            <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      padding: '6px 12px', 
                      borderRadius: '8px', 
                      textDecoration: 'none', 
                      color: isActive ? 'var(--primary-emerald)' : 'var(--text-secondary)', 
                      backgroundColor: isActive ? 'var(--primary-emerald-light)' : 'transparent', 
                      fontWeight: isActive ? '700' : '600', 
                      fontSize: '0.82rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {/* Status Pill */}
            <div className="dynamic-island-pill hide-mobile" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              <span>Ward {user?.wardNumber || '4'}</span>
            </div>

            {getRoleBadge(user?.role)}

            <span className="hide-mobile" style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {displayName}
            </span>

            <button 
              onClick={logout} 
              className="btn btn-outline" 
              style={{ padding: '6px', borderRadius: '8px', width: '32px', height: '32px', color: '#DC2626', borderColor: '#FCA5A5' }} 
              title="Logout Session"
            >
              <LogOut size={15} />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} 
              className="btn btn-outline show-mobile-flex" 
              style={{ padding: '6px', borderRadius: '8px', width: '34px', height: '34px' }}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {isMobileMenuOpen && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-divider)', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '10px 14px', 
                    borderRadius: '8px', 
                    textDecoration: 'none', 
                    color: isActive ? 'var(--primary-emerald)' : 'var(--text-primary)', 
                    backgroundColor: isActive ? 'var(--primary-emerald-light)' : 'transparent', 
                    fontWeight: isActive ? '700' : '600', 
                    fontSize: '0.88rem'
                  }}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1140px', width: '100%', margin: '0 auto', padding: '24px 20px 40px 20px' }}>
        {children}
      </main>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><RoleRoute allowedRoles={['Admin']}><AdminDashboardPage /></RoleRoute></PrivateRoute>} />
            <Route path="/employment" element={<PrivateRoute><EmploymentPage /></PrivateRoute>} />
            <Route path="/market" element={<PrivateRoute><MarketplacePage /></PrivateRoute>} />
            <Route path="/agriculture" element={<PrivateRoute><AgriculturePage /></PrivateRoute>} />
            <Route path="/disaster" element={<PrivateRoute><DisasterPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
