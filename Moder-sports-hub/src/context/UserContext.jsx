
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';


export const UserContext = createContext();


export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch users from backend API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Get admin token from localStorage (or your auth state)
      let adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        // Try to get token from moder_admin_user if not set directly
        const adminUser = localStorage.getItem('moder_admin_user');
        if (adminUser) {
          try {
            const parsed = JSON.parse(adminUser);
            if (parsed.token) adminToken = parsed.token;
          } catch {}
        }
      }
      const res = await axios.get(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : '',
        }
      });
      // Normalize user data to ensure 'id' is set (MongoDB uses _id)
      const normalizedUsers = res.data.map(user => ({
        ...user,
        id: user._id || user.id,
        orders: user.orders || 0,
        spent: user.spent || 0,
        joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
        status: user.status || 'Active'
      }));
      setUsers(normalizedUsers);
    } catch (err) {
      setError('Could not load users');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Expose refreshUsers to re-fetch users list
  const refreshUsers = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const loginUser = (email, password) => {
    console.log('Login attempt:', email)
    console.log('Available users:', users)
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (user) {
      // Check if user is admin - admins must use admin login
      if (user.role === 'admin') {
        return { error: 'Admin accounts must use the Admin Login page.' }
      }
      if (user.status === 'Suspended') {
        return { error: 'Your account has been suspended. Please contact support.' }
      }
      // Update last login
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, lastLogin: new Date().toISOString().split('T')[0] } : u
      ))
      return { user: { id: user.id, name: user.name, email: user.email, role: user.role || 'user' } }
    }
    return { error: 'Invalid email or password' }
  }

  const registerUser = async (userData) => {
    try {
      // POST to backend API
      const res = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      // After successful registration, fetch users again
      let adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        const adminUser = localStorage.getItem('moder_admin_user');
        if (adminUser) {
          try {
            const parsed = JSON.parse(adminUser);
            if (parsed.token) adminToken = parsed.token;
          } catch {}
        }
      }
      const usersRes = await axios.get(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : '',
        }
      });
      setUsers(usersRes.data);
      return { user: res.data };
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        return { error: err.response.data.message };
      }
      return { error: 'Registration failed' };
    }
  }

  const updateUserStatus = async (userId, newStatus) => {
    try {
      // Get admin token
      let adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        const adminUser = localStorage.getItem('moder_admin_user');
        if (adminUser) {
          try {
            const parsed = JSON.parse(adminUser);
            if (parsed.token) adminToken = parsed.token;
          } catch {}
        }
      }
      
      // Call backend API to persist the status change
      await axios.patch(`${API_BASE_URL}/users/${userId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: adminToken ? `Bearer ${adminToken}` : '',
          }
        }
      );
      
      // Update local state using callback to avoid closure issues
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error('Failed to update user status:', err);
      // Optionally refresh users to get correct state
      fetchUsers();
    }
  }

  const updateUserProfile = (userId, updates) => {
    setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u))
  }

  const incrementUserStats = (userId, orderTotal) => {
    setUsers(users.map(u => u.id === userId ? { 
      ...u, 
      orders: u.orders + 1, 
      spent: u.spent + orderTotal 
    } : u))
  }

  const getUserById = (userId) => {
    return users.find(u => u.id === userId)
  }

  const getUserByEmail = (email) => {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase())
  }

  const getUserStats = () => {
    const safeUsers = Array.isArray(users) ? users : [];
    return {
      total: safeUsers.length,
      active: safeUsers.filter(u => u.status === 'Active').length,
      inactive: safeUsers.filter(u => u.status === 'Inactive').length,
      suspended: safeUsers.filter(u => u.status === 'Suspended').length,
      totalRevenue: safeUsers.reduce((sum, u) => sum + (u.spent || 0), 0),
      avgOrders: safeUsers.length > 0 ? (safeUsers.reduce((sum, u) => sum + (u.orders || 0), 0) / safeUsers.length).toFixed(1) : '0.0',
    }
  }

  return (
    <UserContext.Provider value={{
      users,
      loading,
      error,
      getUserStats,
      updateUserStatus,
      updateUserProfile,
      incrementUserStats,
      getUserById,
      getUserByEmail,
      registerUser,
      loginUser,
      refreshUsers,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider')
  }
  return context
}
