import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import { useUsers } from '../../context/UserContext'
import { useOrders } from '../../context/OrderContext'

// Export users to CSV
const exportUsersToCSV = (users, getOrdersByEmail) => {
  const headers = ['User ID', 'Name', 'Email', 'Phone', 'Status', 'Registered Date', 'Total Orders', 'Total Spent']
  const csvData = users.map(user => {
    const userOrders = getOrdersByEmail(user.email)
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    return [
      user.id,
      user.name || 'N/A',
      user.email,
      user.phone || 'N/A',
      user.status || 'Active',
      user.createdAt || 'N/A',
      userOrders.length,
      totalSpent
    ]
  })
  
  const csvContent = [headers, ...csvData]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// Export users to JSON
const exportUsersToJSON = (users, getOrdersByEmail) => {
  const usersWithStats = users.map(user => {
    const userOrders = getOrdersByEmail(user.email)
    return {
      ...user,
      password: '***hidden***',
      totalOrders: userOrders.length,
      totalSpent: userOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    }
  })
  const jsonContent = JSON.stringify(usersWithStats, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)

  link.download = `users_export_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}

export default function AdminUsers() {
  const { users, loading, error, getUserStats, refreshUsers } = useUsers();
  // Patch: Add updateUserStatus from UserContext
  const { updateUserStatus } = useContext(UserContext);
  const { getOrdersByEmail } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Refresh users every time component mounts or when tab becomes visible
  useEffect(() => {
    refreshUsers();
    
    // Also refresh when window/tab gets focus (user comes back to this tab)
    const handleFocus = () => refreshUsers();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshUsers]);

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (userId, newStatus) => {
    updateUserStatus(userId, newStatus)
  }

  const stats = getUserStats()

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-success'
      case 'inactive': return 'bg-secondary'
      case 'suspended': return 'bg-danger'
      default: return 'bg-secondary'
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="text-white mb-1">
            <i className="bi bi-people me-2 text-warning"></i>User Management
          </h2>
          <p className="text-muted-custom mb-0">
            Manage customer logins, accounts & access
            <span className="badge bg-info ms-2">
              <i className="bi bi-shield-check me-1"></i>Authentication Control
            </span>
          </p>
        </div>
        <div className="position-relative">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <i className="bi bi-download me-2"></i>Export Users
            <i className="bi bi-chevron-down ms-2"></i>
          </button>
          {showExportMenu && (
            <div 
              className="position-absolute end-0 mt-2 card-dark p-2 shadow"
              style={{ zIndex: 1000, minWidth: '200px' }}
            >
              <button 
                className="btn btn-ghost w-100 text-start text-white mb-1"
                onClick={() => { exportUsersToCSV(filteredUsers, getOrdersByEmail); setShowExportMenu(false); }}
              >
                <i className="bi bi-file-earmark-spreadsheet me-2 text-success"></i>
                Export as CSV
              </button>
              <button 
                className="btn btn-ghost w-100 text-start text-white mb-1"
                onClick={() => { exportUsersToJSON(filteredUsers, getOrdersByEmail); setShowExportMenu(false); }}
              >
                <i className="bi bi-file-earmark-code me-2 text-info"></i>
                Export as JSON
              </button>
              <hr className="my-2 border-secondary" />
              <button 
                className="btn btn-ghost w-100 text-start text-white"
                onClick={() => { exportUsersToCSV(users, getOrdersByEmail); setShowExportMenu(false); }}
              >
                <i className="bi bi-files me-2 text-warning"></i>
                Export All ({users.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="alert alert-warning bg-opacity-10 border-warning mb-4" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
        <div className="d-flex align-items-center">
          <i className="bi bi-person-lock text-warning me-3 fs-4"></i>
          <div>
            <strong className="text-white">User Login & Account Management</strong>
            <p className="text-muted-custom mb-0 small">
              Control user access status (Active/Inactive/Suspended). Users login with their registered email & password.
              <span className="ms-2 text-warning">Product inventory is managed separately in Products section.</span>
            </p>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card-dark text-center">
            <p className="text-muted-custom small mb-1">Total Users</p>
            <h4 className="text-white mb-0">{stats.total}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card-dark text-center">
            <p className="text-muted-custom small mb-1">Active Users</p>
            <h4 className="text-success mb-0">{stats.active}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card-dark text-center">
            <p className="text-muted-custom small mb-1">Total Revenue</p>
            <h4 className="text-warning mb-0">₹{stats.totalRevenue.toLocaleString('en-IN')}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card-dark text-center">
            <p className="text-muted-custom small mb-1">Avg Orders/User</p>
            <h4 className="text-white mb-0">{stats.avgOrders}</h4>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-dark mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-dark border-custom text-muted-custom">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-dark"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-8">
            <div className="d-flex flex-wrap gap-2">
              {['All', 'Active', 'Inactive', 'Suspended'].map((status) => (
                <button
                  key={status}
                  className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-dark">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0">
            <thead>
              <tr className="border-secondary">
                <th className="text-muted-custom fw-normal">User</th>
                <th className="text-muted-custom fw-normal">Joined</th>
                <th className="text-muted-custom fw-normal">Orders</th>
                <th className="text-muted-custom fw-normal">Total Spent</th>
                <th className="text-muted-custom fw-normal">Status</th>
                <th className="text-muted-custom fw-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id || user.email} className="border-secondary">
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                        <span className="text-white fw-bold">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-white">{user.name}</div>
                        <div className="text-muted-custom small">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-custom">{user.joined}</td>
                  <td className="text-white">{user.orders}</td>
                  <td className="text-warning">₹{user.spent.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(user.status)}`}>{user.status}</span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedUser(user)}>
                        <i className="bi bi-eye"></i>
                      </button>
                      <select
                        className="form-select form-select-sm bg-dark text-white border-secondary"
                        style={{ width: 'auto' }}
                        value=""
                        onChange={(e) => {
                          if (e.target.value) handleStatusChange(user.id, e.target.value)
                        }}
                      >
                        <option value="">Actions</option>
                        <option value="Active">Set Active</option>
                        <option value="Suspended">Suspend</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={() => setSelectedUser(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white">
                  <i className="bi bi-person-circle me-2 text-warning"></i>User Profile
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedUser(null)}></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <span className="text-white display-5 fw-bold">{selectedUser.name.charAt(0)}</span>
                  </div>
                  <h4 className="text-white mb-1">{selectedUser.name}</h4>
                  <p className="text-muted-custom mb-1">{selectedUser.email}</p>
                  {selectedUser.phone && <p className="text-muted-custom small mb-0"><i className="bi bi-telephone me-1"></i>{selectedUser.phone}</p>}
                </div>
                
                {selectedUser.address && (
                  <div className="bg-dark rounded p-3 mb-3">
                    <p className="text-muted-custom small mb-1"><i className="bi bi-geo-alt me-1"></i>Address</p>
                    <p className="text-white mb-0">
                      {typeof selectedUser.address === 'object' && selectedUser.address !== null
                        ? Object.entries(selectedUser.address).map(([key, value]) => (
                            <span key={key}>{key}: {value}<br /></span>
                          ))
                        : selectedUser.address}
                    </p>
                  </div>
                )}
                
                <div className="row g-3">
                  <div className="col-6">
                    <div className="bg-dark rounded p-3 text-center">
                      <p className="text-muted-custom small mb-1">Member Since</p>
                      <p className="text-white mb-0">{selectedUser.joined}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-dark rounded p-3 text-center">
                      <p className="text-muted-custom small mb-1">Last Login</p>
                      <p className="text-white mb-0">{selectedUser.lastLogin || 'Never'}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-dark rounded p-3 text-center">
                      <p className="text-muted-custom small mb-1">Total Orders</p>
                      <p className="text-white mb-0">{selectedUser.orders}</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-dark rounded p-3 text-center">
                      <p className="text-muted-custom small mb-1">Total Spent</p>
                      <p className="text-warning mb-0">₹{selectedUser.spent.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h6 className="text-white mb-3">Account Status</h6>
                  <div className="d-flex gap-2">
                    <button 
                      className={`btn btn-sm ${selectedUser.status === 'Active' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => handleStatusChange(selectedUser.id, 'Active')}
                    >
                      <i className="bi bi-check-circle me-1"></i>Active
                    </button>
                    <button 
                      className={`btn btn-sm ${selectedUser.status === 'Suspended' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => handleStatusChange(selectedUser.id, 'Suspended')}
                    >
                      <i className="bi bi-slash-circle me-1"></i>Suspend
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button className="btn btn-outline-secondary" onClick={() => setSelectedUser(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
