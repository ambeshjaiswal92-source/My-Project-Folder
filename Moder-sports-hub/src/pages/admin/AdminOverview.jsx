import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '../../context/OrderContext'
import { useUsers } from '../../context/UserContext'
import { useProducts } from '../../context/ProductContext'

// Export full report
const exportFullReport = (orderStats, userStats, products, orders) => {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalRevenue: orderStats.totalRevenue,
      totalOrders: orderStats.totalOrders,
      todayOrders: orderStats.todayOrders,
      todayRevenue: orderStats.todayRevenue,
      totalUsers: userStats.total,
      activeUsers: userStats.active,
      totalProducts: products.length
    },
    ordersByStatus: {
      pending: orderStats.pending,
      processing: orderStats.processing,
      shipped: orderStats.shipped,
      delivered: orderStats.delivered,
      cancelled: orderStats.cancelled
    },
    recentOrders: orders.slice(0, 20).map(o => ({
      id: o.id,
      customer: o.customer,
      total: o.total,
      status: o.status,
      date: o.date
    })),
    topProducts: calculateTopProducts(orders)
  }
  
  const jsonContent = JSON.stringify(report, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `store_report_${new Date().toISOString().split('T')[0]}.json`
  link.click()
}

// Export report as CSV
const exportReportCSV = (orderStats, userStats, products, orders) => {
  const lines = [
    ['MODER SPORTS HUB - STORE REPORT'],
    [`Generated: ${new Date().toLocaleString()}`],
    [''],
    ['=== REVENUE SUMMARY ==='],
    ['Metric', 'Value'],
    ['Total Revenue', `₹${orderStats.totalRevenue.toLocaleString('en-IN')}`],
    ['Today Revenue', `₹${orderStats.todayRevenue.toLocaleString('en-IN')}`],
    [''],
    ['=== ORDER SUMMARY ==='],
    ['Status', 'Count'],
    ['Total Orders', orderStats.totalOrders],
    ['Today Orders', orderStats.todayOrders],
    ['Pending', orderStats.pending],
    ['Processing', orderStats.processing],
    ['Shipped', orderStats.shipped],
    ['Delivered', orderStats.delivered],
    ['Cancelled', orderStats.cancelled],
    [''],
    ['=== USER SUMMARY ==='],
    ['Metric', 'Value'],
    ['Total Users', userStats.total],
    ['Active Users', userStats.active],
    ['Total Products', products.length],
    [''],
    ['=== RECENT ORDERS ==='],
    ['Order ID', 'Customer', 'Total', 'Status', 'Date'],
    ...orders.slice(0, 20).map(o => [o.id, o.customer || 'N/A', o.total, o.status, o.date])
  ]
  
  const csvContent = lines.map(row => Array.isArray(row) ? row.join(',') : row).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `store_report_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// Calculate top products helper
const calculateTopProducts = (orders) => {
  const productSales = {}
  orders.forEach(order => {
    order.items?.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = { name: item.name, sold: 0, revenue: 0 }
      }
      productSales[item.name].sold += item.qty
      productSales[item.name].revenue += item.price * item.qty
    })
  })
  return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
}

function AdminOverview() {
  const { orders, getOrderStats } = useOrders()
  const { getUserStats } = useUsers()
  const { getActiveProducts } = useProducts()
  const [showExportMenu, setShowExportMenu] = useState(false)
  
  const orderStats = getOrderStats()
  const userStats = getUserStats()
  const products = getActiveProducts()

  const stats = [
    { label: 'Total Revenue', value: `₹${orderStats.totalRevenue.toLocaleString('en-IN')}`, change: '+12.5%', positive: true, icon: 'bi-currency-rupee' },
    { label: 'Orders Today', value: orderStats.todayOrders.toString(), change: `+${orderStats.todayOrders}`, positive: true, icon: 'bi-bag-check' },
    { label: 'Active Users', value: userStats.active.toLocaleString(), change: '+23', positive: true, icon: 'bi-people' },
    { label: 'Products', value: products.length.toString(), change: `${products.length} active`, positive: true, icon: 'bi-box-seam' },
  ]

  const recentOrders = orders.slice(0, 5)

  // Calculate top products from orders
  const productSales = {}
  orders.forEach(order => {
    order.items?.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = { name: item.name, sold: 0, revenue: 0 }
      }
      productSales[item.name].sold += item.qty
      productSales[item.name].revenue += item.price * item.qty
    })
  })
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4)

  const quickActions = [
    { label: 'View your online store', icon: 'bi-shop', link: '/', external: true },
    { label: 'Manage Products (Store Inventory)', icon: 'bi-box-seam', link: '/admin/products' },
    { label: 'Manage User Logins & Accounts', icon: 'bi-person-badge', link: '/admin/users' },
    { label: 'Process pending orders', icon: 'bi-clock-history', link: '/admin/orders' },
  ]

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-success'
      case 'shipped': return 'bg-info'
      case 'processing': return 'bg-warning text-dark'
      case 'pending': return 'bg-secondary'
      default: return 'bg-secondary'
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="text-white mb-1">Dashboard Overview</h2>
          <p className="text-muted-custom mb-0">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="d-flex gap-2">
          <div className="position-relative">
            <button 
              className="btn btn-outline-secondary"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <i className="bi bi-download me-2"></i>Export Report
              <i className="bi bi-chevron-down ms-2"></i>
            </button>
            {showExportMenu && (
              <div 
                className="position-absolute end-0 mt-2 card-dark p-2 shadow"
                style={{ zIndex: 1000, minWidth: '220px' }}
              >
                <button 
                  className="btn btn-ghost w-100 text-start text-white mb-1"
                  onClick={() => { exportReportCSV(orderStats, userStats, products, orders); setShowExportMenu(false); }}
                >
                  <i className="bi bi-file-earmark-spreadsheet me-2 text-success"></i>
                  Export Report (CSV)
                </button>
                <button 
                  className="btn btn-ghost w-100 text-start text-white mb-1"
                  onClick={() => { exportFullReport(orderStats, userStats, products, orders); setShowExportMenu(false); }}
                >
                  <i className="bi bi-file-earmark-code me-2 text-info"></i>
                  Export Report (JSON)
                </button>
                <hr className="my-2 border-secondary" />
                <small className="text-muted-custom px-3 d-block mb-2">Includes:</small>
                <ul className="list-unstyled px-3 mb-0">
                  <li className="text-muted-custom small"><i className="bi bi-check text-success me-1"></i>Revenue Summary</li>
                  <li className="text-muted-custom small"><i className="bi bi-check text-success me-1"></i>Order Statistics</li>
                  <li className="text-muted-custom small"><i className="bi bi-check text-success me-1"></i>User Statistics</li>
                  <li className="text-muted-custom small"><i className="bi bi-check text-success me-1"></i>Recent Orders</li>
                  <li className="text-muted-custom small"><i className="bi bi-check text-success me-1"></i>Top Products</li>
                </ul>
              </div>
            )}
          </div>
          <Link to="/admin/products" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i>Add Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="col-md-6 col-xl-3">
            <div className="card-dark h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted-custom small mb-1">{stat.label}</p>
                  <h3 className="text-white mb-0">{stat.value}</h3>
                </div>
                <div className={`rounded-circle p-2 ${stat.positive ? 'bg-success' : 'bg-danger'} bg-opacity-10`}>
                  <i className={`bi ${stat.icon} fs-5 ${stat.positive ? 'text-success' : 'text-danger'}`}></i>
                </div>
              </div>
              <span className={`badge ${stat.positive ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${stat.positive ? 'text-success' : 'text-danger'} mt-3`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="row g-4">
        {/* Recent Orders */}
        <div className="col-lg-8">
          <div className="card-dark h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white mb-0">
                <i className="bi bi-receipt me-2 text-warning"></i>Recent Orders
              </h5>
              <Link to="/admin/orders" className="btn btn-link text-warning p-0 text-decoration-none">
                View all <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0">
                <thead>
                  <tr className="border-secondary">
                    <th className="text-muted-custom fw-normal">Order ID</th>
                    <th className="text-muted-custom fw-normal">Customer</th>
                    <th className="text-muted-custom fw-normal">Items</th>
                    <th className="text-muted-custom fw-normal">Total</th>
                    <th className="text-muted-custom fw-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-secondary">
                      <td className="text-warning">{order.id}</td>
                      <td className="text-white">{order.customer}</td>
                      <td className="text-white">{order.itemCount || order.items?.length || 0}</td>
                      <td className="text-white">₹{order.total.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="col-lg-4">
          {/* Top Products */}
          <div className="card-dark mb-4">
            <h5 className="text-white mb-4">
              <i className="bi bi-trophy me-2 text-warning"></i>Top Products
            </h5>
            <ul className="list-unstyled mb-0">
              {topProducts.length > 0 ? topProducts.map((product, idx) => (
                <li key={product.name} className="d-flex align-items-center py-2 border-bottom border-secondary">
                  <span className="badge bg-warning text-dark me-3">#{idx + 1}</span>
                  <div className="flex-grow-1">
                    <div className="text-white small">{product.name}</div>
                    <div className="text-muted-custom small">{product.sold} sold • ₹{product.revenue.toLocaleString('en-IN')}</div>
                  </div>
                </li>
              )) : (
                <li className="text-muted-custom text-center py-3">No sales data yet</li>
              )}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="card-dark">
            <h5 className="text-white mb-4">
              <i className="bi bi-lightning me-2 text-warning"></i>Quick Actions
            </h5>
            <div className="d-grid gap-2">
              {quickActions.map((action) => (
                action.external ? (
                  <a 
                    key={action.label} 
                    href={action.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline-warning text-start text-decoration-none"
                  >
                    <i className={`bi ${action.icon} me-2`}></i>{action.label}
                  </a>
                ) : (
                  <Link key={action.label} to={action.link} className="btn btn-outline-secondary text-start text-decoration-none">
                    <i className={`bi ${action.icon} me-2`}></i>{action.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOverview
