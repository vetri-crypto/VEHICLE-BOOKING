import React, { createContext, useState, useEffect } from 'react';
import { getMe, loginUser as apiLogin, registerUser as apiRegister } from '../services/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getMe();
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('[Auth Init Error]:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const res = await apiLogin(credentials);
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
        return res.data;
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await apiRegister(userData);
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data);
        return res.data;
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUserInContext = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUserInContext,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
