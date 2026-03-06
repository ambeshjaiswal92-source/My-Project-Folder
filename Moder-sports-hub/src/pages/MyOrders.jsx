import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '../context/OrderContext'
import Swal from 'sweetalert2'

// Generate unique tracking number
const generateTrackingNumber = (orderId) => {
  return `MSH${orderId.replace('ORD-', '').replace('#SO-', '')}IN`
}

// Get shipping status steps with dates
const getShippingSteps = (status, orderDate) => {
  const baseDate = new Date(orderDate)
  const steps = [
    { id: 1, name: 'Order Placed', icon: 'bi-bag-check', completed: true, date: baseDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), time: '10:30 AM' },
    { id: 2, name: 'Processing', icon: 'bi-gear', completed: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status), date: new Date(baseDate.getTime() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), time: '2:15 PM' },
    { id: 3, name: 'Shipped', icon: 'bi-truck', completed: ['Shipped', 'Out for Delivery', 'Delivered'].includes(status), date: new Date(baseDate.getTime() + 172800000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), time: '9:00 AM' },
    { id: 4, name: 'Out for Delivery', icon: 'bi-bicycle', completed: ['Out for Delivery', 'Delivered'].includes(status), date: new Date(baseDate.getTime() + 518400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), time: '8:30 AM' },
    { id: 5, name: 'Delivered', icon: 'bi-house-check', completed: status === 'Delivered', date: new Date(baseDate.getTime() + 604800000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), time: '4:45 PM' },
  ]
  return steps
}

// Get estimated delivery date
const getEstimatedDelivery = (orderDate) => {
  const date = new Date(orderDate)
  date.setDate(date.getDate() + 7)
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

// Generate tracking history
const getTrackingHistory = (status, orderDate, trackingNumber) => {
  const baseDate = new Date(orderDate)
  const history = [
    { date: baseDate, status: 'Order Placed', location: 'Online', description: 'Your order has been confirmed and is being prepared.' },
  ]
  
  if (['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status)) {
    history.push({ 
      date: new Date(baseDate.getTime() + 86400000), 
      status: 'Processing', 
      location: 'Warehouse - Mumbai', 
      description: 'Order is being processed and packed at our warehouse.' 
    })
  }
  
  if (['Shipped', 'Out for Delivery', 'Delivered'].includes(status)) {
    history.push({ 
      date: new Date(baseDate.getTime() + 172800000), 
      status: 'Shipped', 
      location: 'In Transit - Mumbai Hub', 
      description: `Package dispatched via Moder Express. Tracking: ${trackingNumber}` 
    })
    history.push({ 
      date: new Date(baseDate.getTime() + 345600000), 
      status: 'In Transit', 
      location: 'Sorting Facility - Pune', 
      description: 'Package arrived at regional sorting facility.' 
    })
  }
  
  if (['Out for Delivery', 'Delivered'].includes(status)) {
    history.push({ 
      date: new Date(baseDate.getTime() + 518400000), 
      status: 'Out for Delivery', 
      location: 'Local Delivery Hub', 
      description: 'Package is out for delivery. Expected today.' 
    })
  }
  
  if (status === 'Delivered') {
    history.push({ 
      date: new Date(baseDate.getTime() + 604800000), 
      status: 'Delivered', 
      location: 'Delivered', 
      description: 'Package has been delivered successfully.' 
    })
  }
  
  return history.reverse()
}

function MyOrders({ user }) {
  const { getOrdersByEmail, updateOrderStatus } = useOrders()
  const orders = user ? getOrdersByEmail(user.email) : []
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [showTrackingModal, setShowTrackingModal] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(null)
  const invoiceRef = useRef(null)

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  // Check if order can be cancelled (only Pending or Processing)
  const canCancelOrder = (status) => {
    return ['Pending', 'Processing'].includes(status)
  }

  // Handle cancel order
  const handleCancelOrder = (e, order) => {
    e.stopPropagation()
    
    Swal.fire({
      title: 'Cancel Order?',
      html: `
        <div style="text-align: left; color: #ccc;">
          <p>Are you sure you want to cancel order <strong style="color: #fff;">${order.id}</strong>?</p>
          <p style="color: #ffc107; font-size: 14px;"><i class="bi bi-exclamation-triangle me-2"></i>This action cannot be undone.</p>
          <hr style="border-color: #444;">
          <p style="font-size: 13px; color: #888;">Order Total: <strong style="color: #ffc107;">₹${Number(order.total).toLocaleString('en-IN')}</strong></p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="bi bi-x-circle me-2"></i>Yes, Cancel Order',
      cancelButtonText: 'Keep Order',
      background: '#1a1a2e',
      color: '#fff',
      customClass: {
        popup: 'border border-secondary'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        updateOrderStatus(order.id, 'Cancelled')
        
        Swal.fire({
          title: 'Order Cancelled',
          html: `
            <p style="color: #ccc;">Your order <strong style="color: #fff;">${order.id}</strong> has been cancelled successfully.</p>
            <p style="color: #888; font-size: 13px;">If you paid online, your refund will be processed within 5-7 business days.</p>
          `,
          icon: 'success',
          confirmButtonColor: '#667eea',
          background: '#1a1a2e',
          color: '#fff',
          customClass: {
            popup: 'border border-secondary'
          }
        })
      }
    })
  }

  const handlePrintInvoice = () => {
    const printContent = invoiceRef.current
    const windowPrint = window.open('', '', 'width=800,height=600')
    windowPrint.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px; }
            .invoice-header h1 { color: #667eea; margin: 0; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-details div { width: 48%; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; }
            .total-row { font-weight: bold; font-size: 18px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `)
    windowPrint.document.close()
    windowPrint.print()
  }

  if (!user) {
    return (
      <main className="container py-5 text-center">
        <i className="bi bi-box text-muted-custom display-4 mb-3"></i>
        <h2 className="text-white mb-2">Sign in to view your orders</h2>
        <p className="text-muted-custom mb-4">Orders are tied to your account email.</p>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/register" className="btn btn-outline-light">Register</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <span className="badge badge-primary mb-2">My Orders</span>
          <h2 className="text-orange-500 mb-1">Your recent purchases</h2>
          <p className="text-muted-custom mb-0">Signed in as {user.email}</p>
        </div>
        <div className="text-muted-custom">Total orders: {orders.length}</div>
      </div>

      {orders.length === 0 ? (
        <div className="card-dark p-4 text-center">
          <i className="bi bi-receipt text-muted-custom display-5 mb-3"></i>
          <h5 className="text-white mb-2">No orders yet</h5>
          <p className="text-muted-custom mb-3">Browse products and place your first order.</p>
          <Link to="/products" className="btn btn-primary">Shop now</Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id
            const shippingSteps = getShippingSteps(order.status, order.date)
            const trackingNumber = generateTrackingNumber(order.id)
            
            return (
              <div key={order.id} className="card-dark overflow-hidden">
                {/* Order Header */}
                <div 
                  className="p-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 cursor-pointer"
                  onClick={() => toggleOrderDetails(order.id)}
                  style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                      <i className="bi bi-box-seam text-white fs-5"></i>
                    </div>
                    <div>
                      <h6 className="text-white mb-1">{order.id}</h6>
                      <small className="text-muted-custom">
                        <i className="bi bi-calendar3 me-1"></i> {order.date}
                        <span className="mx-2">•</span>
                        <i className="bi bi-box me-1"></i> {order.itemCount} items
                      </small>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center gap-3">                    {/* Cancel Button for eligible orders */}
                    {canCancelOrder(order.status) && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => handleCancelOrder(e, order)}
                        title="Cancel Order"
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Cancel
                      </button>
                    )}                    <div className="text-end">
                      <div className="text-warning fw-bold fs-5">₹{Number(order.total || 0).toLocaleString('en-IN')}</div>
                      <span className={`badge ${
                        order.status === 'Delivered' ? 'bg-success' : 
                        order.status === 'Shipped' ? 'bg-info' : 
                        order.status === 'Processing' ? 'bg-warning text-dark' :
                        order.status === 'Cancelled' ? 'bg-danger' : 'bg-secondary'
                      }`}>
                        {order.status === 'Cancelled' && <i className="bi bi-x-circle me-1"></i>}
                        {order.status}
                      </span>
                    </div>
                    <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} text-muted-custom fs-5`}></i>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {isExpanded && (
                  <div className="border-top border-secondary">
                    {/* Tracking Info */}
                    <div className="p-3 border-bottom border-secondary" style={{ background: 'rgba(102, 126, 234, 0.05)' }}>
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <i className="bi bi-truck text-warning"></i>
                            <span className="text-white fw-semibold">Tracking Number:</span>
                            <code className="bg-dark px-2 py-1 rounded text-info">{trackingNumber}</code>
                          </div>
                          <small className="text-muted-custom">
                            <i className="bi bi-clock me-1"></i>
                            Estimated Delivery: <span className="text-white">{getEstimatedDelivery(order.date)}</span>
                          </small>
                        </div>
                        <div className="col-md-6 text-md-end mt-3 mt-md-0">
                          {order.status !== 'Cancelled' && (
                            <button 
                              className="btn btn-sm btn-outline-info me-2"
                              onClick={(e) => { e.stopPropagation(); setShowTrackingModal(order.id); }}
                            >
                              <i className="bi bi-geo-alt me-1"></i> Track Package
                            </button>
                          )}
                          <button 
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={(e) => { e.stopPropagation(); setShowInvoiceModal(order.id); }}
                          >
                            <i className="bi bi-receipt me-1"></i> Invoice
                          </button>
                          {canCancelOrder(order.status) && (
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={(e) => handleCancelOrder(e, order)}
                            >
                              <i className="bi bi-x-circle me-1"></i> Cancel Order
                            </button>
                          )}
                          {order.status === 'Cancelled' && (
                            <span className="badge bg-danger py-2 px-3">
                              <i className="bi bi-x-circle me-1"></i> Order Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Progress */}
                    <div className="p-3 border-bottom border-secondary">
                      <h6 className="text-white mb-3">
                        <i className="bi bi-signpost-split me-2 text-warning"></i>
                        {order.status === 'Cancelled' ? 'Order Status' : 'Shipping Progress'}
                      </h6>
                      
                      {order.status === 'Cancelled' ? (
                        /* Cancelled Order Display */
                        <div className="text-center py-4">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{ width: '80px', height: '80px', background: 'rgba(220, 53, 69, 0.2)', border: '2px solid #dc3545' }}
                          >
                            <i className="bi bi-x-lg text-danger fs-2"></i>
                          </div>
                          <h5 className="text-danger mb-2">Order Cancelled</h5>
                          <p className="text-muted-custom mb-3">
                            This order was cancelled on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <div className="d-inline-block p-3 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <small className="text-muted-custom d-block mb-1">Refund Status</small>
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-clock me-1"></i>Processing Refund
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* Normal Shipping Progress */
                        <div className="d-flex justify-content-between position-relative">
                        {/* Progress Line */}
                        <div 
                          className="position-absolute" 
                          style={{ 
                            top: '20px', 
                            left: '10%', 
                            right: '10%', 
                            height: '3px', 
                            background: '#2d2d44',
                            zIndex: 0
                          }}
                        >
                          <div 
                            style={{ 
                              width: `${(shippingSteps.filter(s => s.completed).length - 1) * 25}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                              transition: 'width 0.5s ease'
                            }}
                          ></div>
                        </div>
                        
                        {shippingSteps.map((step) => (
                          <div key={step.id} className="text-center position-relative" style={{ zIndex: 1, flex: 1 }}>
                            <div 
                              className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${
                                step.completed ? '' : 'bg-secondary'
                              }`}
                              style={{ 
                                width: '40px', 
                                height: '40px',
                                background: step.completed ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined
                              }}
                            >
                              <i className={`bi ${step.icon} ${step.completed ? 'text-white' : 'text-muted-custom'}`}></i>
                            </div>
                            <small className={`d-block ${step.completed ? 'text-white' : 'text-muted-custom'}`} style={{ fontSize: '11px' }}>
                              {step.name}
                            </small>
                          </div>
                        ))}
                      </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="p-3">
                      <h6 className="text-white mb-3">
                        <i className="bi bi-bag me-2 text-warning"></i>
                        Order Items
                      </h6>
                      <div className="d-flex flex-column gap-3">
                        {order.items?.map((item, idx) => (
                          <div 
                            key={`${order.id}-${idx}`} 
                            className="d-flex gap-3 p-3 rounded"
                            style={{ background: 'rgba(255,255,255,0.03)' }}
                          >
                            {/* Product Image */}
                            <div 
                              className="rounded overflow-hidden flex-shrink-0"
                              style={{ width: '80px', height: '80px' }}
                            >
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-100 h-100"
                                  style={{ objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
                                  <i className="bi bi-image text-muted-custom fs-4"></i>
                                </div>
                              )}
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-grow-1">
                              <h6 className="text-white mb-1">{item.name}</h6>
                              <div className="d-flex flex-wrap gap-2 mb-2">
                                {item.selectedSize && (
                                  <span className="badge bg-secondary">Size: {item.selectedSize}</span>
                                )}
                                {item.selectedColor && (
                                  <span className="badge bg-secondary">Color: {item.selectedColor}</span>
                                )}
                                <span className="badge bg-dark">Qty: {item.qty}</span>
                              </div>
                              <div className="text-muted-custom small">
                                <span className="text-warning">₹{Number(item.price || 0).toLocaleString('en-IN')}</span>
                                <span className="mx-1">×</span>
                                <span>{item.qty}</span>
                                <span className="mx-2">=</span>
                                <span className="text-white fw-semibold">₹{Number((item.price || 0) * item.qty).toLocaleString('en-IN')}</span>
                              </div>
                            </div>

                            {/* Item Status */}
                            <div className="text-end">
                              <span className={`badge ${
                                order.status === 'Delivered' ? 'bg-success' : 'bg-info'
                              }`}>
                                <i className={`bi ${order.status === 'Delivered' ? 'bi-check-circle' : 'bi-clock'} me-1`}></i>
                                {order.status === 'Delivered' ? 'Delivered' : 'In Transit'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="mt-4 pt-3 border-top border-secondary">
                        <div className="row">
                          <div className="col-md-6">
                            <h6 className="text-white mb-2">
                              <i className="bi bi-geo-alt me-2 text-warning"></i>
                              Delivery Address
                            </h6>
                            <p className="text-muted-custom small mb-0">
                              {order.shippingAddress || 'Address not available'}
                            </p>
                          </div>
                          <div className="col-md-6 text-md-end mt-3 mt-md-0">
                            <div className="text-muted-custom small mb-1">
                              Subtotal: ₹{Number(order.total || 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-muted-custom small mb-1">
                              Shipping: <span className="text-success">FREE</span>
                            </div>
                            <div className="text-white fw-bold fs-5">
                              Total: <span className="text-warning">₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tracking Modal */}
                {showTrackingModal === order.id && (
                  <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1060 }}
                    onClick={() => setShowTrackingModal(null)}
                  >
                    <div 
                      className="card-dark p-4 m-3"
                      style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Header */}
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                          <h5 className="text-white mb-1">
                            <i className="bi bi-geo-alt-fill text-info me-2"></i>
                            Track Package
                          </h5>
                          <small className="text-muted-custom">Order {order.id}</small>
                        </div>
                        <button 
                          className="btn btn-ghost text-white"
                          onClick={() => setShowTrackingModal(null)}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>

                      {/* Tracking Info */}
                      <div className="p-3 rounded mb-4" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                        <div className="row">
                          <div className="col-6">
                            <small className="text-muted-custom d-block">Tracking Number</small>
                            <span className="text-info fw-semibold">{trackingNumber}</span>
                          </div>
                          <div className="col-6 text-end">
                            <small className="text-muted-custom d-block">Carrier</small>
                            <span className="text-white">Moder Express</span>
                          </div>
                        </div>
                        <hr className="border-secondary my-3" />
                        <div className="row">
                          <div className="col-6">
                            <small className="text-muted-custom d-block">Status</small>
                            <span className={`badge ${
                              order.status === 'Delivered' ? 'bg-success' : 
                              order.status === 'Shipped' ? 'bg-info' : 
                              order.status === 'Processing' ? 'bg-warning text-dark' : 'bg-secondary'
                            }`}>{order.status}</span>
                          </div>
                          <div className="col-6 text-end">
                            <small className="text-muted-custom d-block">Est. Delivery</small>
                            <span className="text-white">{getEstimatedDelivery(order.date)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tracking Timeline */}
                      <h6 className="text-white mb-3">
                        <i className="bi bi-clock-history me-2 text-warning"></i>
                        Tracking History
                      </h6>
                      <div className="position-relative ps-4">
                        {getTrackingHistory(order.status, order.date, trackingNumber).map((event, idx) => (
                          <div key={idx} className="position-relative mb-4">
                            {/* Timeline dot */}
                            <div 
                              className="position-absolute rounded-circle"
                              style={{ 
                                left: '-24px', 
                                top: '4px',
                                width: '12px', 
                                height: '12px', 
                                background: idx === 0 ? '#667eea' : '#4a4a6a',
                                border: idx === 0 ? '3px solid rgba(102, 126, 234, 0.3)' : 'none'
                              }}
                            ></div>
                            {/* Timeline line */}
                            {idx < getTrackingHistory(order.status, order.date, trackingNumber).length - 1 && (
                              <div 
                                className="position-absolute"
                                style={{ 
                                  left: '-19px', 
                                  top: '20px',
                                  width: '2px', 
                                  height: 'calc(100% + 10px)', 
                                  background: '#2d2d44'
                                }}
                              ></div>
                            )}
                            {/* Content */}
                            <div>
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <span className={`fw-semibold ${idx === 0 ? 'text-info' : 'text-white'}`}>
                                  {event.status}
                                </span>
                                <small className="text-muted-custom">
                                  {event.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </small>
                              </div>
                              <small className="text-muted-custom d-block mb-1">
                                <i className="bi bi-geo-alt me-1"></i>{event.location}
                              </small>
                              <small className="text-muted-custom">{event.description}</small>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address */}
                      <div className="p-3 rounded mt-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <h6 className="text-white mb-2">
                          <i className="bi bi-house me-2 text-warning"></i>
                          Delivery Address
                        </h6>
                        <p className="text-muted-custom small mb-0">
                          {order.shippingAddress || order.address || 'Address not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invoice Modal */}
                {showInvoiceModal === order.id && (
                  <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1060 }}
                    onClick={() => setShowInvoiceModal(null)}
                  >
                    <div 
                      className="bg-white text-dark p-4 m-3 rounded"
                      style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Close Button */}
                      <div className="d-flex justify-content-end mb-2">
                        <button 
                          className="btn btn-sm btn-outline-dark"
                          onClick={() => setShowInvoiceModal(null)}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>

                      {/* Invoice Content */}
                      <div ref={invoiceRef}>
                        <div className="invoice-header text-center mb-4 pb-3 border-bottom border-2" style={{ borderColor: '#667eea' }}>
                          <h2 className="mb-1" style={{ color: '#667eea' }}>
                            <i className="bi bi-lightning-charge-fill me-2"></i>
                            MODER SPORTS HUB
                          </h2>
                          <p className="text-muted mb-0">Tax Invoice</p>
                        </div>

                        <div className="row mb-4">
                          <div className="col-6">
                            <h6 className="fw-bold mb-2">Bill To:</h6>
                            <p className="mb-1">{order.customer || 'Customer'}</p>
                            <p className="mb-1 text-muted small">{order.email}</p>
                            <p className="mb-0 text-muted small">{order.shippingAddress || order.address || 'Address not available'}</p>
                          </div>
                          <div className="col-6 text-end">
                            <h6 className="fw-bold mb-2">Invoice Details:</h6>
                            <p className="mb-1"><strong>Invoice #:</strong> INV-{order.id.replace('#', '').replace('SO-', '')}</p>
                            <p className="mb-1"><strong>Date:</strong> {order.date}</p>
                            <p className="mb-0"><strong>Status:</strong> <span className="badge bg-success">{order.status}</span></p>
                          </div>
                        </div>

                        <table className="table" style={{ borderColor: '#e0e0e0' }}>
                          <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <tr>
                              <th className="text-white border-0">Item</th>
                              <th className="text-white text-center border-0">Qty</th>
                              <th className="text-white text-end border-0">Price</th>
                              <th className="text-white text-end border-0">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items?.map((item, idx) => (
                              <tr key={idx} style={{ background: idx % 2 === 0 ? '#f8f9fa' : '#ffffff' }}>
                                <td style={{ borderColor: '#e0e0e0' }}>
                                  <strong style={{ color: '#333' }}>{item.name}</strong>
                                  {(item.selectedSize || item.selectedColor) && (
                                    <small className="d-block" style={{ color: '#764ba2' }}>
                                      {item.selectedSize && `Size: ${item.selectedSize}`}
                                      {item.selectedSize && item.selectedColor && ' | '}
                                      {item.selectedColor && `Color: ${item.selectedColor}`}
                                    </small>
                                  )}
                                </td>
                                <td className="text-center" style={{ borderColor: '#e0e0e0', color: '#555' }}>{item.qty}</td>
                                <td className="text-end" style={{ borderColor: '#e0e0e0', color: '#555' }}>₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                                <td className="text-end fw-semibold" style={{ borderColor: '#e0e0e0', color: '#667eea' }}>₹{Number((item.price || 0) * item.qty).toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot style={{ background: '#f8f9fa' }}>
                            <tr>
                              <td colSpan="3" className="text-end" style={{ borderColor: '#e0e0e0', color: '#555' }}>Subtotal:</td>
                              <td className="text-end" style={{ borderColor: '#e0e0e0', color: '#333' }}>₹{Number(order.total || 0).toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                              <td colSpan="3" className="text-end" style={{ borderColor: '#e0e0e0', color: '#555' }}>Shipping:</td>
                              <td className="text-end fw-semibold" style={{ borderColor: '#e0e0e0', color: '#28a745' }}>FREE</td>
                            </tr>
                            <tr>
                              <td colSpan="3" className="text-end" style={{ borderColor: '#e0e0e0', color: '#555' }}>Tax (GST 18%):</td>
                              <td className="text-end" style={{ borderColor: '#e0e0e0', color: '#333' }}>₹{Number((order.total || 0) * 0.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            </tr>
                            <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                              <td colSpan="3" className="text-end text-white fw-bold fs-5 border-0">Grand Total:</td>
                              <td className="text-end text-white fw-bold fs-5 border-0">₹{Number((order.total || 0) * 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            </tr>
                          </tfoot>
                        </table>

                        <div className="text-center mt-4 pt-3" style={{ borderTop: '2px solid #667eea' }}>
                          <p className="mb-1" style={{ color: '#667eea', fontWeight: '500' }}>Thank you for shopping with Moder Sports Hub!</p>
                          <p className="small mb-0" style={{ color: '#764ba2' }}>
                            <i className="bi bi-envelope me-1"></i> support@moder.com | 
                            <i className="bi bi-telephone ms-2 me-1"></i> +91 98765 43210
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex justify-content-center gap-3 mt-4 pt-3 border-top">
                        <button 
                          className="btn text-white"
                          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                          onClick={handlePrintInvoice}
                        >
                          <i className="bi bi-printer me-2"></i> Print Invoice
                        </button>
                        <button 
                          className="btn"
                          style={{ border: '2px solid #667eea', color: '#667eea' }}
                          onClick={() => setShowInvoiceModal(null)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default MyOrders
