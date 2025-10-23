import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/index.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try { setUserInfo(JSON.parse(storedUser)); }
      catch (e) { console.error("Failed to parse userInfo", e); localStorage.removeItem('userInfo'); }
    }
  }, []);

  const saveLogin = (data) => {
    const userDataToStore = {
       _id: data._id, name: data.name, email: data.email, subscription: data.subscription,
       jee_mains_crl_rank: data.jee_mains_crl_rank, jee_mains_category: data.jee_mains_category, jee_mains_category_rank: data.jee_mains_category_rank,
       jee_advanced_crl_rank: data.jee_advanced_crl_rank, jee_advanced_category: data.jee_advanced_category, jee_advanced_category_rank: data.jee_advanced_category_rank,
       createdAt: data.createdAt, updatedAt: data.updatedAt, // Store updatedAt too
       token: data.token || userInfo?.token // Keep existing token if not re-issued
    };
    localStorage.setItem('userInfo', JSON.stringify(userDataToStore));
    setUserInfo(userDataToStore);
  };

  const login = async (email, password) => {
    try { const { data } = await api.post('/auth/login', { email, password }); saveLogin(data); return data; }
    catch (error) { console.error('Login failed', error); throw error; }
  };

  const signup = async (formData) => {
    try { const { data } = await api.post('/auth/register', formData); return data; }
    catch (error) { console.error('Signup failed', error); throw error; }
  };

  const logout = () => { localStorage.removeItem('userInfo'); setUserInfo(null); };

  return (
    <AuthContext.Provider value={{ userInfo, login, signup, logout, saveLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => { return useContext(AuthContext); };