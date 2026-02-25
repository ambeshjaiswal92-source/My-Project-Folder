import { useEffect, useState } from 'react';
import axios from 'axios';

function UserProfile({ userId, token }) {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: { street: '', city: '', state: '', pincode: '' } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/api/users/${userId}`, {
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
      await axios.put(`/api/users/${userId}`, {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h2>यूज़र प्रोफाइल</h2>
      {success && <div className="alert alert-success">{success}</div>}
      {!edit ? (
        <div>
          <p><b>नाम:</b> {profile.name}</p>
          <p><b>ईमेल:</b> {profile.email}</p>
          <p><b>फ़ोन:</b> {profile.phone || '-'}</p>
          <p><b>पता:</b> {profile.address?.street}, {profile.address?.city}, {profile.address?.state}, {profile.address?.pincode}</p>
          <button className="btn btn-primary" onClick={() => setEdit(true)}>संपादित करें</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-2">
            <label>नाम:</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="mb-2">
            <label>फ़ोन:</label>
            <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="mb-2">
            <label>पता:</label>
            <input className="form-control mb-1" name="address.street" placeholder="गली/मोहल्ला" value={form.address.street} onChange={handleChange} />
            <input className="form-control mb-1" name="address.city" placeholder="शहर" value={form.address.city} onChange={handleChange} />
            <input className="form-control mb-1" name="address.state" placeholder="राज्य" value={form.address.state} onChange={handleChange} />
            <input className="form-control mb-1" name="address.pincode" placeholder="पिनकोड" value={form.address.pincode} onChange={handleChange} />
          </div>
          <button className="btn btn-success me-2" type="submit">सेव करें</button>
          <button className="btn btn-secondary" type="button" onClick={() => setEdit(false)}>रद्द करें</button>
        </form>
      )}
    </div>
  );
}

export default UserProfile;
