import { useState } from 'react'
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AdminOverview from './AdminOverview'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import AdminUsers from './AdminUsers'
import AdminSettings from './AdminSettings'

function AdminDashboard({ admin, onLogout }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { path: '/admin', label: 'Overview', icon: 'bi-speedometer2', desc: 'Dashboard' },
    { path: '/admin/products', label: 'Products', icon: 'bi-box-seam', desc: 'Store Inventory' },
    { path: '/admin/orders', label: 'Orders', icon: 'bi-cart3', desc: 'Customer Orders' },
    { path: '/admin/users', label: 'Users', icon: 'bi-people', desc: 'Login & Accounts' },
    { path: '/admin/settings', label: 'Settings', icon: 'bi-gear', desc: 'Configuration' },
  ]

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <div className={`d-flex ${sidebarOpen ? '' : 'sidebar-collapsed'}`} style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className={`admin-sidebar bg-dark ${sidebarOpen ? '' : 'collapsed'}`} style={{ width: sidebarOpen ? '260px' : '70px', transition: 'width 0.3s' }}>
        <div className="p-3 border-bottom border-secondary">
          <Link to="/admin" className="d-flex align-items-center text-decoration-none">
            <i className="bi bi-lightning-charge-fill text-warning fs-4 me-2"></i>
            {sidebarOpen && <span className="text-white fw-bold">Moder Admin</span>}
          </Link>
          <button 
            className="btn btn-link text-muted-custom p-0 position-absolute" 
            style={{ right: '10px', top: '15px' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
          </button>
        </div>

        <nav className="nav flex-column p-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link d-flex align-items-center py-2 px-3 rounded mb-1 ${isActive(item.path) ? 'bg-primary text-white' : 'text-muted-custom'}`}
              title={item.desc}
            >
              <i className={`bi ${item.icon} ${sidebarOpen ? 'me-3' : ''} fs-5`}></i>
              {sidebarOpen && (
                <div>
                  <span className="d-block">{item.label}</span>
                  <small className="text-muted-custom opacity-75" style={{ fontSize: '0.7rem' }}>{item.desc}</small>
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-3 border-top border-secondary">
          <Link to="/" target="_blank" className="btn btn-outline-warning w-100 mb-3 d-flex align-items-center justify-content-center">
            <i className={`bi bi-shop ${sidebarOpen ? 'me-2' : ''}`}></i>
            {sidebarOpen && <span>View Store</span>}
          </Link>
          
          {sidebarOpen && (
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-white small fw-bold">{admin?.name || 'Admin'}</div>
                <div className="text-muted-custom small">Administrator</div>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          )}
          
          {!sidebarOpen && (
            <button className="btn btn-outline-secondary btn-sm w-100" onClick={onLogout}>
              <i className="bi bi-box-arrow-right"></i>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/settings" element={<AdminSettings admin={admin} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default AdminDashboard
