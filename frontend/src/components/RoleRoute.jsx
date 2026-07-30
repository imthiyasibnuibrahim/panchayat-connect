import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function RoleRoute({ allowedRoles, children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Authenticating user role...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div
          className="card glass-panel"
          style={{
            maxWidth: '500px',
            margin: '0 auto',
            borderTop: '4px solid #EF4444',
            padding: '32px 24px',
          }}
        >
          <h2 style={{ color: '#DC2626', marginBottom: '12px' }}>🔒 Access Forbidden</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Your account role (<strong>{user.role}</strong>) does not have authorization to access this area.
          </p>
          <a
            href="/"
            className="btn btn-primary"
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            Return to Main Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
