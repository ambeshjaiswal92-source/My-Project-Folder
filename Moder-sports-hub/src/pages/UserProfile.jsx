import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

function UserProfile({ userId, token, onLogout }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: { street: '', city: '', state: '', pincode: '' } });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setForm({
          name: res.data.name || '',
          phone: res.data.phone || '',
          address: res.data.address || { street: '', city: '', state: '', pincode: '' }
        });
      } catch (err) {
        setError('Could not load profile');
      }
      setLoading(false);
    }
    fetchProfile();
  }, [userId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      setForm(f => ({ ...f, address: { ...f.address, [name.split('.')[1]]: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.put(`${API_BASE_URL}/users/${userId}`, {
        name: form.name,
        phone: form.phone,
        address: form.address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Profile updated successfully!');
      setEdit(false);
      setProfile({ ...profile, ...form });
    } catch (err) {
      setError('Update failed');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(f => ({ ...f, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/users/${userId}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Password change failed');
    }
  };

  if (loading) return <div className="text-center py-5" style={{ color: '#e0e0e0' }}>Loading...</div>;
  if (error) return <div className="text-danger text-center py-5">{error}</div>;

  const handleSignOut = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="container py-4" style={{ color: '#e0e0e0' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0" style={{ color: '#ffc107' }}>User Profile</h2>
        <div className="d-flex gap-2">
          <Link to="/my-products" className="btn btn-outline-warning">
            <i className="bi bi-box me-2"></i>My Products
          </Link>
          <Link to="/orders" className="btn btn-outline-warning">
            <i className="bi bi-bag-check me-2"></i>My Orders
          </Link>
          <button className="btn btn-outline-danger" onClick={handleSignOut}>
            <i className="bi bi-box-arrow-right me-2"></i>Sign Out
          </button>
        </div>
      </div>
      {success && <div className="alert alert-success">{success}</div>}
      {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}
      {!edit ? (
        <div className="card p-4" style={{ background: '#1b263b', border: 'none' }}>
          <p><b style={{ color: '#ffc107' }}>Name:</b> {profile.name}</p>
          <p><b style={{ color: '#ffc107' }}>Email:</b> {profile.email}</p>
          <p><b style={{ color: '#ffc107' }}>Phone:</b> {profile.phone || '-'}</p>
          <p><b style={{ color: '#ffc107' }}>Address:</b> {profile.address?.street}, {profile.address?.city}, {profile.address?.state}, {profile.address?.pincode}</p>
          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-warning" onClick={() => setEdit(true)}>Edit Profile</button>
            <button className="btn btn-outline-warning" onClick={() => setShowPasswordForm(!showPasswordForm)}>
              <i className="bi bi-key me-2"></i>Change Password
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 card p-4" style={{ background: '#1b263b', border: 'none' }}>
          <div className="mb-3">
            <label className="form-label" style={{ color: '#ffc107' }}>Name:</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required style={{ background: '#0d1b2a', color: '#fff', border: '1px solid #3a4a5a' }} />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: '#ffc107' }}>Phone:</label>
            <input className="form-control" name="phone" value={form.phone} onChange={handleChange} style={{ background: '#0d1b2a', color: '#fff', border: '1px solid #3a4a5a' }} />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: '#ffc107' }}>Address:</label>
            <input className="form-control mb-2" name="address.street" placeholder="Street" value={form.address.street} onChange={handleChange} style={{ background: '#0d1b2a', color: '#fff', border: '1px solid #3a4a5a' }} />
            <input className="form-control mb-2" name="address.city" placeholder="City" value={form.address.city} onChange={handleChange} style={{ background: '#0d1b2a', color: '#fff', border: '1px solid #3a4a5a' }} />
            <input className="form-control mb-2" name="address.state" placeholder="State" value={form.address.state} onChange={handleChange} style={{ background: '#0d1b2a', color: '#fff', border: '1px solid #3a4a5a' }} />
            <input className="form-control" name="address.pincode" placeholder="Pincode" value={form.address.pincode} onChange={handleChange} style={{ background: '#0d1b2a', color: '#fff', border: '1px solid #3a4a5a' }} />
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-warning" type="submit">Save</button>
            <button className="btn btn-secondary" type="button" onClick={() => setEdit(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Change Password Form */}
      {showPasswordForm && (
        <div className="card p-4 mt-4" style={{ background: '#1b263b', border: 'none' }}>
          <h5 className="mb-3" style={{ color: '#ffc107' }}>
            <i className="bi bi-key me-2"></i>Change Password
          </h5>
          {passwordError && <div className="alert alert-danger">{passwordError}</div>}
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label className="form-label" style={{ color: '#ffc107' }}>Current Password:</label>
              <input 
                type="password" 
                className="form-control" 
                name="currentPassword" 
                value={passwordForm.currentPassword} 
                onChange={handlePasswordChange} 
                required 
                style={{ background: '#0d1b2a', color: '#fff', border: '1px solid #3a4a5a' }} 
              />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ color: '#ffc107' }}>New Password:</label>
              <input 
                type="password" 
                className="form-control" 
                name="newPassword" 
                value={passwordForm.newPassword} 
                onChange={handlePasswordChange} 
                required 
                minLength={6}
                style={{ background: '#0d1b2a', color: '#fff', border: '1px solid #3a4a5a' }} 
              />
              <small style={{ color: '#aaa' }}>Minimum 6 characters</small>
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ color: '#ffc107' }}>Confirm New Password:</label>
              <input 
                type="password" 
                className="form-control" 
                name="confirmPassword" 
                value={passwordForm.confirmPassword} 
                onChange={handlePasswordChange} 
                required 
                style={{ background: '#0d1b2a', color: '#fff', border: '1px solid #3a4a5a' }} 
              />
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-warning" type="submit">Update Password</button>
              <button className="btn btn-secondary" type="button" onClick={() => {
                setShowPasswordForm(false);
                setPasswordError('');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
