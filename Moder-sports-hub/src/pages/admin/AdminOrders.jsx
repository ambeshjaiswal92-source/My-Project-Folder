import { useState, useEffect } from 'react'
import { useOrders } from '../../context/OrderContext'

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

// Export orders to CSV
const exportOrdersToCSV = (orders) => {
  const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Items', 'Total', 'Status', 'Address', 'Payment Method']
  const csvData = orders.map(order => [
    order.id,
    order.customer || 'N/A',
    order.email || 'N/A',
    order.date,
    order.itemCount || order.items?.length || 0,
    order.total,
    order.status,
    order.shippingAddress || order.address || 'N/A',
    order.paymentMethod || 'N/A'
  ])
  
  const csvContent = [headers, ...csvData]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// Export orders to JSON
const exportOrdersToJSON = (orders) => {
  const jsonContent = JSON.stringify(orders, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `orders_export_${new Date().toISOString().split('T')[0]}.json`
  link.click()
}

function AdminOrders() {
  const { orders, updateOrderStatus, refreshOrders } = useOrders()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Refresh orders on mount and window focus
  useEffect(() => {
    refreshOrders()
    const handleFocus = () => refreshOrders()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshOrders])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus)
  }

  const orderCounts = {
    All: orders.length,
    Pending: orders.filter((o) => o.status === 'Pending').length,
    Processing: orders.filter((o) => o.status === 'Processing').length,
    Shipped: orders.filter((o) => o.status === 'Shipped').length,
    Delivered: orders.filter((o) => o.status === 'Delivered').length,
    Cancelled: orders.filter((o) => o.status === 'Cancelled').length,
  }

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-success'
      case 'shipped': return 'bg-info'
      case 'processing': return 'bg-warning text-dark'
      case 'pending': return 'bg-secondary'
      case 'cancelled': return 'bg-danger'
      default: return 'bg-secondary'
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="text-white mb-1">Orders</h2>
          <p className="text-muted-custom mb-0">Manage and track customer orders</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-warning"
            onClick={refreshOrders}
            title="Refresh Orders"
          >
            <i className="bi bi-arrow-clockwise me-2"></i>Refresh
          </button>
          <div className="position-relative">
            <button 
              className="btn btn-outline-secondary"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <i className="bi bi-download me-2"></i>Export Orders
              <i className="bi bi-chevron-down ms-2"></i>
            </button>
          {showExportMenu && (
            <div 
              className="position-absolute end-0 mt-2 card-dark p-2 shadow"
              style={{ zIndex: 1000, minWidth: '200px' }}
            >
              <button 
                className="btn btn-ghost w-100 text-start text-white mb-1"
                onClick={() => { exportOrdersToCSV(filteredOrders); setShowExportMenu(false); }}
              >
                <i className="bi bi-file-earmark-spreadsheet me-2 text-success"></i>
                Export as CSV
              </button>
              <button 
                className="btn btn-ghost w-100 text-start text-white mb-1"
                onClick={() => { exportOrdersToJSON(filteredOrders); setShowExportMenu(false); }}
              >
                <i className="bi bi-file-earmark-code me-2 text-info"></i>
                Export as JSON
              </button>
              <hr className="my-2 border-secondary" />
              <button 
                className="btn btn-ghost w-100 text-start text-white"
                onClick={() => { exportOrdersToCSV(orders); setShowExportMenu(false); }}
              >
                <i className="bi bi-files me-2 text-warning"></i>
                Export All ({orders.length})
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {['All', ...statusOptions].map((status) => (
          <button
            key={status}
            className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterStatus(status)}
          >
            {status}
            <span className={`badge ${filterStatus === status ? 'bg-white text-primary' : 'bg-secondary'} ms-2`}>
              {orderCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card-dark mb-4">
        <div className="input-group">
          <span className="input-group-text bg-dark border-custom text-muted-custom">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control form-control-dark"
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-dark">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0">
            <thead>
              <tr className="border-secondary">
                <th className="text-muted-custom fw-normal">Order ID</th>
                <th className="text-muted-custom fw-normal">Customer</th>
                <th className="text-muted-custom fw-normal">Date</th>
                <th className="text-muted-custom fw-normal">Items</th>
                <th className="text-muted-custom fw-normal">Total</th>
                <th className="text-muted-custom fw-normal">Status</th>
                <th className="text-muted-custom fw-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-secondary">
                  <td className="text-warning">{order.id}</td>
                  <td>
                    <div className="text-white">{order.customer}</div>
                    <div className="text-muted-custom small">{order.email}</div>
                  </td>
                  <td className="text-muted-custom">{order.date}</td>
                  <td className="text-white">{order.itemCount || order.items?.length || 0} items</td>
                  <td className="text-white">₹{order.total.toLocaleString('en-IN')}</td>
                  <td>
                    <select
                      className={`form-select form-select-sm bg-transparent border-0 ${getStatusBadgeClass(order.status)} text-white`}
                      style={{ width: 'auto' }}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status} className="bg-dark">{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedOrder(order)}>
                      <i className="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} onClick={() => setSelectedOrder(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white">
                  <i className="bi bi-receipt me-2 text-warning"></i>Order {selectedOrder.id}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedOrder(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="text-warning mb-3">
                      <i className="bi bi-person me-2"></i>Customer Info
                    </h6>
                    <p className="mb-1"><strong className="text-white">Name:</strong> <span className="text-muted-custom">{selectedOrder.customer}</span></p>
                    <p className="mb-1"><strong className="text-white">Email:</strong> <span className="text-muted-custom">{selectedOrder.email}</span></p>
                    {selectedOrder.phone && <p className="mb-1"><strong className="text-white">Phone:</strong> <span className="text-muted-custom">{selectedOrder.phone}</span></p>}
                    {selectedOrder.address && <p className="mb-0"><strong className="text-white">Address:</strong> <span className="text-muted-custom">{selectedOrder.address}</span></p>}
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-warning mb-3">
                      <i className="bi bi-info-circle me-2"></i>Order Info
                    </h6>
                    <p className="mb-1"><strong className="text-white">Date:</strong> <span className="text-muted-custom">{selectedOrder.date}</span></p>
                    <p className="mb-1"><strong className="text-white">Status:</strong> <span className={`badge ${getStatusBadgeClass(selectedOrder.status)} ms-2`}>{selectedOrder.status}</span></p>
                  </div>
                </div>
                
                {/* Order Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-warning mb-3">
                      <i className="bi bi-box me-2"></i>Order Items
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-dark table-sm mb-0">
                        <thead>
                          <tr className="border-secondary">
                            <th className="text-muted-custom fw-normal">Item</th>
                            <th className="text-muted-custom fw-normal text-center">Qty</th>
                            <th className="text-muted-custom fw-normal text-end">Price</th>
                            <th className="text-muted-custom fw-normal text-end">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, idx) => (
                            <tr key={idx} className="border-secondary">
                              <td className="text-white">{item.name}</td>
                              <td className="text-white text-center">{item.qty}</td>
                              <td className="text-muted-custom text-end">₹{item.price.toLocaleString('en-IN')}</td>
                              <td className="text-warning text-end">₹{(item.price * item.qty).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-secondary">
                            <td colSpan="3" className="text-white text-end fw-bold">Total:</td>
                            <td className="text-warning text-end fw-bold">₹{selectedOrder.total.toLocaleString('en-IN')}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-secondary">
                <button className="btn btn-outline-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
                <button className="btn btn-primary">
                  <i className="bi bi-printer me-2"></i>Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders
