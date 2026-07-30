import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Axios Interceptor for adding Authorization header
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  // Load User on initial mount if token exists with timeout safety guard
  useEffect(() => {
    let isMounted = true;
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 5000);

    const loadUser = async () => {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/v1/auth/me', { timeout: 6000 });
        if (isMounted && res.data?.data) {
          setUser(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
        localStorage.removeItem('token');
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [token]);

  const sendOtp = async (phoneNumber) => {
    const res = await axios.post('/api/v1/auth/send-otp', { phoneNumber });
    return res.data;
  };

  const verifyOtp = async (phoneNumber, otpCode) => {
    const res = await axios.post('/api/v1/auth/verify-otp', { phoneNumber, otpCode });
    return res.data;
  };

  const login = async (phoneNumber, password) => {
    const res = await axios.post('/api/v1/auth/login', { phoneNumber, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.data);
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post('/api/v1/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const role = user?.role || 'Guest';
  const isAdmin = role === 'Admin';
  const isSeller = role === 'Seller' || role === 'Admin';
  const isAuthority = role === 'Authority' || role === 'Admin';
  const isCitizen = role === 'Citizen';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        logout,
        role,
        isAdmin,
        isSeller,
        isAuthority,
        isCitizen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
