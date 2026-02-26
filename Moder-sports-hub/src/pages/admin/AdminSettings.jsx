import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

// Default slider images
const defaultSliderImages = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
    title: 'Gym & Fitness',
    subtitle: 'Train harder, get stronger',
    offer: 'Up to 40% OFF',
    active: true
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
    title: 'Running Gear',
    subtitle: 'Built for speed',
    offer: 'Flash Sale - 30% OFF',
    active: true
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    title: 'Basketball',
    subtitle: 'Dominate the court',
    offer: 'Buy 2 Get 1 Free',
    active: true
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
    title: 'Football',
    subtitle: 'Own the pitch',
    offer: 'Season Sale - 50% OFF',
    active: true
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    title: 'Workout Equipment',
    subtitle: 'Premium gear for athletes',
    offer: 'New Arrivals - 25% OFF',
    active: true
  },
]

// Load slider images from localStorage
const loadSliderImages = () => {
  try {
    const saved = localStorage.getItem('moder_slider_images')
    return saved ? JSON.parse(saved) : defaultSliderImages
  } catch {
    return defaultSliderImages
  }
}

// Save slider images to localStorage
const saveSliderImages = (images) => {
  localStorage.setItem('moder_slider_images', JSON.stringify(images))
}

// Load admin accounts from localStorage
const loadAdminAccounts = () => {
  try {
    const saved = localStorage.getItem('moder_admin_accounts')
    return saved ? JSON.parse(saved) : [
      { id: 1, email: 'admin@moder.com', password: 'admin123', name: 'Super Admin', role: 'Super Admin', status: 'Active', createdAt: '2026-01-01' }
    ]
  } catch {
    return [{ id: 1, email: 'admin@moder.com', password: 'admin123', name: 'Super Admin', role: 'Super Admin', status: 'Active', createdAt: '2026-01-01' }]
  }
}

// Save admin accounts to localStorage
const saveAdminAccounts = (accounts) => {
  localStorage.setItem('moder_admin_accounts', JSON.stringify(accounts))
}

// Load notification settings from localStorage
const loadNotificationSettings = () => {
  try {
    const saved = localStorage.getItem('moder_admin_notifications')
    return saved ? JSON.parse(saved) : {
      newOrders: true,
      lowStock: true,
      newUsers: false,
      dailyReport: true,
      emailNotifications: true,
      pushNotifications: false,
      soundAlerts: true,
    }
  } catch {
    return {
      newOrders: true,
      lowStock: true,
      newUsers: false,
      dailyReport: true,
      emailNotifications: true,
      pushNotifications: false,
      soundAlerts: true,
    }
  }
}

// Save notification settings to localStorage
const saveNotificationSettings = (settings) => {
  localStorage.setItem('moder_admin_notifications', JSON.stringify(settings))
}

function AdminSettings({ admin }) {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Moder Sports Hub',
    storeEmail: 'support@moder.com',
    currency: 'INR',
    taxRate: 8.5,
    freeShippingThreshold: 100,
  })

  const [notificationSettings, setNotificationSettings] = useState(loadNotificationSettings())

  const [saved, setSaved] = useState(false)
  const [adminAccounts, setAdminAccounts] = useState(loadAdminAccounts())
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'Admin' })
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  
  // Slider management states
  const [sliderImages, setSliderImages] = useState(loadSliderImages())
  const [showAddSlider, setShowAddSlider] = useState(false)
  const [editingSlider, setEditingSlider] = useState(null)
  const [newSlider, setNewSlider] = useState({ image: '', title: '', subtitle: '', offer: '' })

  useEffect(() => {
    saveAdminAccounts(adminAccounts)
  }, [adminAccounts])

  // Save notification settings when they change
  useEffect(() => {
    saveNotificationSettings(notificationSettings)
  }, [notificationSettings])

  // Save slider images when they change
  useEffect(() => {
    saveSliderImages(sliderImages)
  }, [sliderImages])

  // Slider management functions
  const handleAddSlider = () => {
    if (!newSlider.image || !newSlider.title) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please provide image URL and title',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#667eea'
      })
      return
    }

    const slider = {
      id: Date.now(),
      image: newSlider.image,
      title: newSlider.title,
      subtitle: newSlider.subtitle || '',
      offer: newSlider.offer || '',
      active: true
    }

    setSliderImages([...sliderImages, slider])
    setNewSlider({ image: '', title: '', subtitle: '', offer: '' })
    setShowAddSlider(false)

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Slider Added!',
      showConfirmButton: false,
      timer: 2000,
      background: '#1a1a2e',
      color: '#fff'
    })
  }

  const handleUpdateSlider = () => {
    if (!editingSlider.image || !editingSlider.title) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please provide image URL and title',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#667eea'
      })
      return
    }

    setSliderImages(sliderImages.map(s => 
      s.id === editingSlider.id ? editingSlider : s
    ))
    setEditingSlider(null)

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Slider Updated!',
      showConfirmButton: false,
      timer: 2000,
      background: '#1a1a2e',
      color: '#fff'
    })
  }

  const handleDeleteSlider = (sliderId) => {
    Swal.fire({
      title: 'Delete Slider?',
      text: 'Are you sure you want to remove this slider image?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete',
      background: '#1a1a2e',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        setSliderImages(sliderImages.filter(s => s.id !== sliderId))
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Slider Deleted!',
          showConfirmButton: false,
          timer: 2000,
          background: '#1a1a2e',
          color: '#fff'
        })
      }
    })
  }

  const toggleSliderActive = (sliderId) => {
    setSliderImages(sliderImages.map(s => 
      s.id === sliderId ? { ...s, active: !s.active } : s
    ))
  }

  const handleStoreChange = (e) => {
    setStoreSettings({ ...storeSettings, [e.target.name]: e.target.value })
  }

  const handleNotificationChange = (key) => {
    const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] }
    setNotificationSettings(newSettings)
    
    // Show toast notification
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: newSettings[key] ? 'success' : 'info',
      title: newSettings[key] ? 'Notification Enabled' : 'Notification Disabled',
      showConfirmButton: false,
      timer: 1500,
      background: '#1a1a2e',
      color: '#fff'
    })
  }

  const handleSave = () => {
    setSaved(true)
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Settings Saved!',
      showConfirmButton: false,
      timer: 2000,
      background: '#1a1a2e',
      color: '#fff'
    })
    setTimeout(() => setSaved(false), 2000)
  }

  // Add new admin
  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please fill in all fields',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#667eea'
      })
      return
    }

    if (adminAccounts.find(a => a.email.toLowerCase() === newAdmin.email.toLowerCase())) {
      Swal.fire({
        icon: 'error',
        title: 'Email Exists',
        text: 'An admin with this email already exists',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#667eea'
      })
      return
    }

    const newAdminAccount = {
      id: Date.now(),
      ...newAdmin,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    }

    setAdminAccounts([...adminAccounts, newAdminAccount])
    setNewAdmin({ name: '', email: '', password: '', role: 'Admin' })
    setShowAddAdmin(false)

    Swal.fire({
      icon: 'success',
      title: 'Admin Added!',
      text: `${newAdminAccount.name} has been added as ${newAdminAccount.role}`,
      background: '#1a1a2e',
      color: '#fff',
      confirmButtonColor: '#667eea'
    })
  }

  // Toggle admin status
  const toggleAdminStatus = (adminId) => {
    setAdminAccounts(adminAccounts.map(a => 
      a.id === adminId 
        ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' }
        : a
    ))
  }

  // Delete admin
  const deleteAdmin = (adminId) => {
    const adminToDelete = adminAccounts.find(a => a.id === adminId)
    if (adminToDelete?.role === 'Super Admin') {
      Swal.fire({
        icon: 'error',
        title: 'Cannot Delete',
        text: 'Super Admin cannot be deleted',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#667eea'
      })
      return
    }

    Swal.fire({
      title: 'Delete Admin?',
      text: `Are you sure you want to remove ${adminToDelete?.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete',
      background: '#1a1a2e',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        setAdminAccounts(adminAccounts.filter(a => a.id !== adminId))
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Admin has been removed',
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#667eea'
        })
      }
    })
  }

  // Change password
  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please fill in all password fields',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#667eea'
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'New passwords do not match',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#667eea'
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Weak Password',
        text: 'Password must be at least 6 characters',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#667eea'
      })
      return
    }

    // Update password in admin accounts
    setAdminAccounts(adminAccounts.map(a => 
      a.email === admin?.email 
        ? { ...a, password: passwordData.newPassword }
        : a
    ))

    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setShowChangePassword(false)

    Swal.fire({
      icon: 'success',
      title: 'Password Changed!',
      text: 'Your password has been updated successfully',
      background: '#1a1a2e',
      color: '#fff',
      confirmButtonColor: '#667eea'
    })
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="text-white mb-1">Settings</h2>
          <p className="text-muted-custom mb-0">Configure your store settings</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? (
            <>
              <i className="bi bi-check-lg me-2"></i>Saved!
            </>
          ) : (
            <>
              <i className="bi bi-floppy me-2"></i>Save Changes
            </>
          )}
        </button>
      </div>

      <div className="row g-4">
        {/* Store Settings */}
        <div className="col-lg-6">
          <div className="card-dark h-100">
            <h5 className="text-white mb-4">
              <i className="bi bi-shop me-2 text-warning"></i>Store Settings
            </h5>
            
            <div className="mb-3">
              <label className="form-label text-white">Store Name</label>
              <input
                type="text"
                className="form-control form-control-dark"
                name="storeName"
                value={storeSettings.storeName}
                onChange={handleStoreChange}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label text-white">Support Email</label>
              <input
                type="email"
                className="form-control form-control-dark"
                name="storeEmail"
                value={storeSettings.storeEmail}
                onChange={handleStoreChange}
              />
            </div>
            
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label text-white">Currency</label>
                <select
                  className="form-select form-control-dark"
                  name="currency"
                  value={storeSettings.currency}
                  onChange={handleStoreChange}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-white">Tax Rate (%)</label>
                <input
                  type="number"
                  className="form-control form-control-dark"
                  name="taxRate"
                  value={storeSettings.taxRate}
                  onChange={handleStoreChange}
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label text-white">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                className="form-control form-control-dark"
                name="freeShippingThreshold"
                value={storeSettings.freeShippingThreshold}
                onChange={handleStoreChange}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="col-lg-6">
          <div className="card-dark h-100">
            <h5 className="text-white mb-4">
              <i className="bi bi-bell me-2 text-warning"></i>Notifications
            </h5>
            
            {/* Notification Delivery Methods */}
            <div className="mb-4">
              <h6 className="text-warning mb-3">
                <i className="bi bi-send me-2"></i>Delivery Methods
              </h6>
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email', icon: 'bi-envelope' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get browser push notifications', icon: 'bi-bell-fill' },
                { key: 'soundAlerts', label: 'Sound Alerts', desc: 'Play sound when notifications arrive', icon: 'bi-volume-up' },
              ].map((item) => (
                <div key={item.key} className="d-flex justify-content-between align-items-center py-2 px-3 mb-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="d-flex align-items-center">
                    <i className={`bi ${item.icon} me-3 text-info`}></i>
                    <div>
                      <div className="text-white">{item.label}</div>
                      <div className="text-muted-custom small">{item.desc}</div>
                    </div>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={notificationSettings[item.key]}
                      onChange={() => handleNotificationChange(item.key)}
                      style={{ width: '3rem', height: '1.5rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Notification Types */}
            <div>
              <h6 className="text-warning mb-3">
                <i className="bi bi-list-check me-2"></i>Notification Types
              </h6>
              {[
                { key: 'newOrders', label: 'New Order Notifications', desc: 'Get notified when a new order is placed', icon: 'bi-cart-check' },
                { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Alert when product stock falls below threshold', icon: 'bi-exclamation-triangle' },
                { key: 'newUsers', label: 'New User Registrations', desc: 'Notify when new users sign up', icon: 'bi-person-plus' },
                { key: 'dailyReport', label: 'Daily Sales Report', desc: 'Receive daily summary of sales and orders', icon: 'bi-graph-up' },
              ].map((item) => (
                <div key={item.key} className="d-flex justify-content-between align-items-center py-2 px-3 mb-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="d-flex align-items-center">
                    <i className={`bi ${item.icon} me-3 text-primary`}></i>
                    <div>
                      <div className="text-white">{item.label}</div>
                      <div className="text-muted-custom small">{item.desc}</div>
                    </div>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={notificationSettings[item.key]}
                      onChange={() => handleNotificationChange(item.key)}
                      style={{ width: '3rem', height: '1.5rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="col-lg-6">
          <div className="card-dark">
            <h5 className="text-white mb-4">
              <i className="bi bi-person-gear me-2 text-warning"></i>Admin Profile
            </h5>
            
            <div className="d-flex align-items-center mb-4">
              <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '60px' }}>
                <span className="text-white display-6 fw-bold">{admin?.name?.charAt(0) || 'A'}</span>
              </div>
              <div>
                <h5 className="text-white mb-1">{admin?.name || 'Admin'}</h5>
                <p className="text-muted-custom mb-1">{admin?.email || 'admin@moder.com'}</p>
                <span className="badge bg-warning text-dark">Administrator</span>
              </div>
            </div>
            
            <div className="d-grid gap-2">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setShowChangePassword(true)}
              >
                <i className="bi bi-key me-2"></i>Change Password
              </button>
              <button className="btn btn-outline-secondary">
                <i className="bi bi-pencil me-2"></i>Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Admin Access Management */}
        <div className="col-12">
          <div className="card-dark">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white mb-0">
                <i className="bi bi-shield-lock me-2 text-warning"></i>Admin Access Management
              </h5>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddAdmin(true)}
              >
                <i className="bi bi-plus-lg me-2"></i>Add Admin
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr className="border-secondary">
                    <th className="text-muted-custom fw-normal">Admin</th>
                    <th className="text-muted-custom fw-normal">Email</th>
                    <th className="text-muted-custom fw-normal">Role</th>
                    <th className="text-muted-custom fw-normal">Status</th>
                    <th className="text-muted-custom fw-normal">Created</th>
                    <th className="text-muted-custom fw-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminAccounts.map((adminAcc) => (
                    <tr key={adminAcc.id} className="border-secondary">
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ 
                              width: '35px', 
                              height: '35px', 
                              background: adminAcc.role === 'Super Admin' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#6c757d'
                            }}
                          >
                            <span className="text-white small fw-bold">{adminAcc.name.charAt(0)}</span>
                          </div>
                          <span className="text-white">{adminAcc.name}</span>
                        </div>
                      </td>
                      <td className="text-muted-custom">{adminAcc.email}</td>
                      <td>
                        <span className={`badge ${adminAcc.role === 'Super Admin' ? 'bg-warning text-dark' : 'bg-info'}`}>
                          {adminAcc.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${adminAcc.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                          {adminAcc.status}
                        </span>
                      </td>
                      <td className="text-muted-custom">{adminAcc.createdAt}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button 
                            className={`btn btn-sm ${adminAcc.status === 'Active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => toggleAdminStatus(adminAcc.id)}
                            disabled={adminAcc.role === 'Super Admin'}
                            title={adminAcc.status === 'Active' ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`bi ${adminAcc.status === 'Active' ? 'bi-pause' : 'bi-play'}`}></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteAdmin(adminAcc.id)}
                            disabled={adminAcc.role === 'Super Admin'}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 p-3 rounded" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
              <small className="text-muted-custom">
                <i className="bi bi-info-circle me-2 text-info"></i>
                <strong>Super Admin</strong> cannot be deleted or deactivated. Admins can log in at <code>/admin-login</code>
              </small>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="col-lg-6">
          <div className="card-dark border-danger">
            <h5 className="text-danger mb-2">
              <i className="bi bi-exclamation-triangle me-2"></i>Danger Zone
            </h5>
            <p className="text-muted-custom mb-4">Irreversible and destructive actions</p>
            
            <div className="d-grid gap-2">
              <button className="btn btn-outline-danger">
                <i className="bi bi-trash me-2"></i>Clear All Data
              </button>
              <button className="btn btn-outline-danger">
                <i className="bi bi-x-circle me-2"></i>Delete Store
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Add Slider Modal */}
      {showAddSlider && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1060 }}
          onClick={() => setShowAddSlider(false)}
        >
          <div 
            className="card-dark p-4"
            style={{ width: '100%', maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white mb-0">
                <i className="bi bi-plus-circle me-2 text-success"></i>Add New Slider
              </h5>
              <button 
                className="btn btn-ghost text-white"
                onClick={() => setShowAddSlider(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Image Preview */}
            {newSlider.image && (
              <div className="mb-3">
                <img 
                  src={newSlider.image} 
                  alt="Preview"
                  className="w-100 rounded"
                  style={{ height: '150px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/400x200/1a1a2e/ffffff?text=Invalid+URL'
                  }}
                />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label text-white">Image URL <span className="text-danger">*</span></label>
              <input
                type="url"
                className="form-control form-control-dark"
                placeholder="https://example.com/image.jpg"
                value={newSlider.image}
                onChange={(e) => setNewSlider({ ...newSlider, image: e.target.value })}
              />
              <small className="text-muted-custom">Use Unsplash, Pexels, or your own image URL</small>
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Title <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control form-control-dark"
                placeholder="e.g., Summer Collection"
                value={newSlider.title}
                onChange={(e) => setNewSlider({ ...newSlider, title: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-white">Subtitle</label>
              <input
                type="text"
                className="form-control form-control-dark"
                placeholder="e.g., Up to 50% off"
                value={newSlider.subtitle}
                onChange={(e) => setNewSlider({ ...newSlider, subtitle: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-white">Offer / Sale</label>
              <input
                type="text"
                className="form-control form-control-dark"
                placeholder="e.g., Flash Sale - 50% OFF"
                value={newSlider.offer}
                onChange={(e) => setNewSlider({ ...newSlider, offer: e.target.value })}
              />
              <small className="text-muted-custom">Optional: Display a special offer or sale badge</small>
            </div>

            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary flex-grow-1"
                onClick={handleAddSlider}
              >
                <i className="bi bi-check-lg me-2"></i>Add Slider
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowAddSlider(false)
                  setNewSlider({ image: '', title: '', subtitle: '', offer: '' })
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Slider Modal */}
      {editingSlider && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1060 }}
          onClick={() => setEditingSlider(null)}
        >
          <div 
            className="card-dark p-4"
            style={{ width: '100%', maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white mb-0">
                <i className="bi bi-pencil-square me-2 text-primary"></i>Edit Slider
              </h5>
              <button 
                className="btn btn-ghost text-white"
                onClick={() => setEditingSlider(null)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Image Preview */}
            <div className="mb-3">
              <img 
                src={editingSlider.image} 
                alt="Preview"
                className="w-100 rounded"
                style={{ height: '150px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x200/1a1a2e/ffffff?text=Invalid+URL'
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Image URL <span className="text-danger">*</span></label>
              <input
                type="url"
                className="form-control form-control-dark"
                placeholder="https://example.com/image.jpg"
                value={editingSlider.image}
                onChange={(e) => setEditingSlider({ ...editingSlider, image: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Title <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control form-control-dark"
                placeholder="e.g., Summer Collection"
                value={editingSlider.title}
                onChange={(e) => setEditingSlider({ ...editingSlider, title: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-white">Subtitle</label>
              <input
                type="text"
                className="form-control form-control-dark"
                placeholder="e.g., Up to 50% off"
                value={editingSlider.subtitle}
                onChange={(e) => setEditingSlider({ ...editingSlider, subtitle: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-white">Offer / Sale</label>
              <input
                type="text"
                className="form-control form-control-dark"
                placeholder="e.g., Flash Sale - 50% OFF"
                value={editingSlider.offer || ''}
                onChange={(e) => setEditingSlider({ ...editingSlider, offer: e.target.value })}
              />
              <small className="text-muted-custom">Optional: Display a special offer or sale badge</small>
            </div>

            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary flex-grow-1"
                onClick={handleUpdateSlider}
              >
                <i className="bi bi-check-lg me-2"></i>Update Slider
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setEditingSlider(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1060 }}
          onClick={() => setShowAddAdmin(false)}
        >
          <div 
            className="card-dark p-4 m-3"
            style={{ maxWidth: '500px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white mb-0">
                <i className="bi bi-person-plus me-2 text-warning"></i>Add New Admin
              </h5>
              <button 
                className="btn btn-ghost text-white"
                onClick={() => setShowAddAdmin(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Full Name</label>
              <input
                type="text"
                className="form-control form-control-dark"
                placeholder="Enter admin name"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Email</label>
              <input
                type="email"
                className="form-control form-control-dark"
                placeholder="admin@example.com"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Password</label>
              <input
                type="password"
                className="form-control form-control-dark"
                placeholder="Min 6 characters"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-white">Role</label>
              <select
                className="form-select form-control-dark"
                value={newAdmin.role}
                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Support">Support</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary flex-grow-1"
                onClick={handleAddAdmin}
              >
                <i className="bi bi-plus-lg me-2"></i>Add Admin
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setShowAddAdmin(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1060 }}
          onClick={() => setShowChangePassword(false)}
        >
          <div 
            className="card-dark p-4 m-3"
            style={{ maxWidth: '450px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white mb-0">
                <i className="bi bi-key me-2 text-warning"></i>Change Password
              </h5>
              <button 
                className="btn btn-ghost text-white"
                onClick={() => setShowChangePassword(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Current Password</label>
              <input
                type="password"
                className="form-control form-control-dark"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">New Password</label>
              <input
                type="password"
                className="form-control form-control-dark"
                placeholder="Min 6 characters"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-white">Confirm New Password</label>
              <input
                type="password"
                className="form-control form-control-dark"
                placeholder="Re-enter new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>

            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary flex-grow-1"
                onClick={handleChangePassword}
              >
                <i className="bi bi-check-lg me-2"></i>Update Password
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setShowChangePassword(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSettings
