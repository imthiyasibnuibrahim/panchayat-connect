import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Home, Briefcase, ShoppingBag, Sprout, Siren, Menu, X, LogOut, User as UserIcon, ShieldCheck, ShieldAlert, Landmark, Smartphone, ChevronRight
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', color: 'var(--primary)' }}>
        <div className="animate-pulse" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
          🌿 Loading Panchayat Connect...
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const location = useLocation();
  const { user, logout, isAdmin } = useContext(AuthContext);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        return <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={12} /> Admin</span>;
      case 'Seller':
        return <span style={{ background: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShoppingBag size={12} /> Seller</span>;
      case 'Authority':
        return <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Landmark size={12} /> Authority</span>;
      default:
        return <span style={{ background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><UserIcon size={12} /> Citizen</span>;
    }
  };

  const displayName = user?.name && typeof user.name === 'string' ? user.name.split(' ')[0] : 'Citizen';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={18} /> },
    ...(isAdmin ? [{ name: 'Admin Control Center', path: '/admin', icon: <ShieldCheck size={18} color="#DC2626" /> }] : []),
    { name: 'Employment Portal', path: '/employment', icon: <Briefcase size={18} /> },
    { name: 'Kudumbashree Market', path: '/market', icon: <ShoppingBag size={18} /> },
    { name: 'Fresh Harvest', path: '/agriculture', icon: <Sprout size={18} /> },
    { name: 'Disaster SOS', path: '/disaster', icon: <Siren size={18} /> },
  ];

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      
      {/* Sleek Native Top Navbar */}
      <header className="glass-panel" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, borderRadius: '0 0 14px 14px', marginBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="btn" style={{ padding: '6px', background: 'transparent' }} aria-label="Toggle navigation menu">
            {isSidebarOpen ? <X size={22} color="var(--text-main)" /> : <Menu size={22} color="var(--text-main)" />}
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '700', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🌴</span> Panchayat Connect
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>Ward 4 • Digital Local Portal</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleInstallPwa}
            className="btn btn-secondary hide-on-mobile-xs"
            style={{ padding: '5px 10px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600' }}
            title="Install App to Phone Screen"
          >
            <Smartphone size={13} /> App
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '4px 8px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
            {getRoleBadge(user?.role)}
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>{displayName}</span>
          </div>
          
          <button onClick={logout} className="btn btn-danger" style={{ padding: '6px 10px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }} title="Logout">
            <LogOut size={13} />
          </button>
        </div>
      </header>

      <div className="main-layout" style={{ display: 'flex', flex: 1, gap: '20px', padding: '0 8px' }}>
        <aside 
          className="glass-panel sidebar-mobile" 
          style={{ 
            width: '240px', 
            borderRadius: '14px',
            padding: '16px 12px',
            display: isSidebarOpen ? 'block' : 'none',
            flexShrink: 0,
            alignSelf: 'flex-start',
            position: 'sticky',
            top: '75px',
            zIndex: 40
          }}
        >
          <div style={{ padding: '0 8px 12px 8px', borderBottom: '1px solid #F1F5F9', marginBottom: '10px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Navigation Menu
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => { if (window.innerWidth <= 768) setSidebarOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: isActive ? 'white' : 'var(--text-main)', backgroundColor: isActive ? 'var(--primary)' : 'transparent', fontWeight: isActive ? '600' : '500', fontSize: '0.85rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.icon} {item.name}
                  </span>
                  <ChevronRight size={14} opacity={isActive ? 0.9 : 0.4} />
                </Link>
              );
            })}

            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
              <button
                onClick={handleInstallPwa}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', justifyContent: 'flex-start' }}
              >
                <Smartphone size={16} /> Add App to Phone Screen
              </button>
            </div>
          </nav>
        </aside>

        <main style={{ flex: 1, paddingBottom: '40px', minWidth: 0 }}>
          {children}
        </main>
      </div>
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
