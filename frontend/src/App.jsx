import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Home, Briefcase, ShoppingBag, Sprout, Siren, Menu, X, LogOut, User as UserIcon, ShieldCheck, ShieldAlert, Landmark, Smartphone 
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
  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>Loading user session...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
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
        return <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={14} /> Central Admin</span>;
      case 'Seller':
        return <span style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShoppingBag size={14} /> Kudumbashree Seller</span>;
      case 'Authority':
        return <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Landmark size={14} /> Panchayat Authority</span>;
      default:
        return <span style={{ background: '#F3F4F6', color: '#374151', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><UserIcon size={14} /> Citizen</span>;
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    ...(isAdmin ? [{ name: 'Admin Control Center', path: '/admin', icon: <ShieldCheck size={20} color="#DC2626" /> }] : []),
    { name: 'Employment Portal', path: '/employment', icon: <Briefcase size={20} /> },
    { name: 'Kudumbashree Market', path: '/market', icon: <ShoppingBag size={20} /> },
    { name: 'Fresh Harvest', path: '/agriculture', icon: <Sprout size={20} /> },
    { name: 'Disaster SOS', path: '/disaster', icon: <Siren size={20} /> },
  ];

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <header className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, borderRadius: '0 0 12px 12px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="btn" style={{ padding: '8px', background: 'transparent' }}>
            {isSidebarOpen ? <X size={24} color="var(--text-main)" /> : <Menu size={24} color="var(--text-main)" />}
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)', fontWeight: '700' }}>Panchayat Connect</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleInstallPwa}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }}
            title="Install App to Phone Screen"
          >
            <Smartphone size={16} color="var(--primary)" /> Add to Phone
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
            {getRoleBadge(user.role)}
            <span style={{ fontSize: '0.95rem' }}>{user.name}</span>
          </div>
          
          <button onClick={logout} className="btn btn-danger" style={{ padding: '8px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }} title="Logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, gap: '24px', padding: '0 24px' }}>
        <aside 
          className="glass-panel" 
          style={{ 
            width: '260px', 
            borderRadius: '12px',
            padding: '20px 16px',
            display: isSidebarOpen ? 'block' : 'none',
            flexShrink: 0,
            alignSelf: 'flex-start',
            position: 'sticky',
            top: '90px'
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none', color: isActive ? 'white' : 'var(--text-main)', backgroundColor: isActive ? 'var(--primary)' : 'transparent', fontWeight: isActive ? '600' : '500' }}>
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main style={{ flex: 1, paddingBottom: '40px' }}>
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
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
