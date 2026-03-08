import { useState } from 'react'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../context/OrderContext'
import { processPayment, processPaymentMethod } from '../services/api'
import api from '../services/api'

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

function Payment({ cart, total, user, appliedCoupon, onApplyCoupon, onRemoveCoupon, onOrderComplete }) {
  const navigate = useNavigate()
  const { addOrder } = useOrders()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  // Calculate final total after coupon discount
  const discount = appliedCoupon?.discount || 0
  const finalTotal = total - discount

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
  })

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    upiId: '',
    bank: '',
  })

  const handleShippingChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value })
  }

  const handlePaymentChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value })
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode,
        orderTotal: total
      })

      if (onApplyCoupon) {
        onApplyCoupon({
          code: response.data.coupon.code,
          discount: response.data.discount,
          description: response.data.coupon.description
        })
      }

      Swal.fire({
        title: 'Coupon Applied!',
        text: `You saved ${formatPrice(response.data.discount)}`,
        icon: 'success',
        background: '#1a1a2e',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponError('')
    if (onRemoveCoupon) {
      onRemoveCoupon()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate based on payment method
    if (paymentMethod === 'card') {
      if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv || !paymentInfo.cardName) {
        setError('Please fill in all card details')
        return
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentInfo.upiId || !paymentInfo.upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g., yourname@upi)')
        return
      }
    } else if (paymentMethod === 'netbanking') {
      if (!paymentInfo.bank) {
        setError('Please select a bank')
        return
      }
    }

    setLoading(true)

    try {
      // Prepare order data for backend API
      const backendOrderData = {
        items: cart.map(item => ({
          product: item._id || item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.qty,
          size: item.selectedSize,
          color: item.selectedColor,
        })),
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.country,
          pincode: shippingInfo.postalCode,
          phone: shippingInfo.phone,
        },
        paymentMethod: paymentMethod === 'card' ? 'Card' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'netbanking' ? 'NetBanking' : 'COD',
        coupon: appliedCoupon ? {
          code: appliedCoupon.code,
          discount: appliedCoupon.discount
        } : null,
      }

      // Call backend API to create order in MongoDB
      const savedOrder = await processPayment(backendOrderData)

      // Process payment and save to payments collection
      const paymentMethodForAPI = paymentMethod === 'card' ? 'Card' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'netbanking' ? 'NetBanking' : 'COD'
      const paymentDetailsForAPI = {
        cardNumber: paymentMethod === 'card' ? paymentInfo.cardNumber : undefined,
        cvv: paymentMethod === 'card' ? paymentInfo.cvv : undefined,
        upiId: paymentMethod === 'upi' ? paymentInfo.upiId : undefined,
        bank: paymentMethod === 'netbanking' ? paymentInfo.bank : undefined,
      }
      await processPaymentMethod(savedOrder._id, paymentMethodForAPI, paymentDetailsForAPI)

      // Also save to local context for display
      const localOrderData = {
        id: savedOrder.orderId || savedOrder._id,
        customer: shippingInfo.fullName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}`,
        shippingAddress: `${shippingInfo.fullName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`,
        items: cart.map(item => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        itemCount: cart.reduce((sum, item) => sum + item.qty, 0),
        subtotal: total,
        discount: discount,
        coupon: appliedCoupon?.code || null,
        total: savedOrder.total || finalTotal,
        shipping: shippingInfo,
        paymentMethod,
        payment: {
          method: paymentMethod,
          cardLast4: paymentMethod === 'card' ? paymentInfo.cardNumber.slice(-4) : null,
          upiId: paymentMethod === 'upi' ? paymentInfo.upiId : null,
          bank: paymentMethod === 'netbanking' ? paymentInfo.bank : null,
        },
        status: savedOrder.status || 'Pending',
        date: new Date().toISOString().split('T')[0],
      }

      addOrder(localOrderData)
      onOrderComplete(localOrderData)
      
      Swal.fire({
        title: 'Order Confirmed!',
        text: 'Your order has been placed successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        background: '#1a1a2e',
        color: '#fff',
        iconColor: '#28a745',
        customClass: {
          popup: 'border border-success'
        }
      }).then(() => {
        navigate('/order-success')
      })
    } catch (err) {
      setError(err.message || 'Failed to process order. Please try again.')
      Swal.fire({
        title: 'Order Failed',
        text: err.message || 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: '#1a1a2e',
        color: '#111',
      })
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <main className="payment-main-container">
      <h1 className="text-black mb-4">
        <i className="bi bi-credit-card me-2"></i>Checkout
      </h1>

      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="payment-form-layout">
        <div className="payment-content-row">
          <div className="payment-left-col">
            {/* Shipping Information */}
            <div className="payment-section-card mb-4">
              <h5 className="text-black mb-4">
                <i className="bi bi-truck me-2 text-warning"></i>Shipping Information
              </h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="fullName" className="form-label text-black">Full Name</label>
                  <input
                    type="text"
                    className="form-control form-control-dark"
                    id="fullName"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleShippingChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="email" className="form-label text-black">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-dark"
                    id="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>

              <div className="mt-3">
                <label htmlFor="phone" className="form-label text-black">Phone Number</label>
                <input
                  type="tel"
                  className="form-control form-control-dark"
                  id="phone"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="mt-3">
                <label htmlFor="address" className="form-label text-black">Address</label>
                <input
                  type="text"
                  className="form-control form-control-dark"
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  placeholder="123 Main St, Apt 4"
                  required
                />
              </div>

              <div className="row g-3 mt-1">
                <div className="col-md-4">
                  <label htmlFor="city" className="form-label text-black">City</label>
                  <input
                    type="text"
                    className="form-control form-control-dark"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="postalCode" className="form-label text-black">Postal Code</label>
                  <input
                    type="text"
                    className="form-control form-control-dark"
                    id="postalCode"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleShippingChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="country" className="form-label text-black">Country</label>
                  <input
                    type="text"
                    className="form-control form-control-dark"
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="payment-section-card">
              <h5 className="text-black mb-4">
                <i className="bi bi-shield-lock me-2 text-warning"></i>Payment Method
              </h5>

              {/* Payment Method Selection */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div
                    className={`payment-method-card ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <i className="bi bi-credit-card fs-3 mb-2"></i>
                    <span>Card</span>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div
                    className={`payment-method-card ${paymentMethod === 'upi' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <i className="bi bi-phone fs-3 mb-2"></i>
                    <span>UPI</span>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div
                    className={`payment-method-card ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('netbanking')}
                  >
                    <i className="bi bi-bank fs-3 mb-2"></i>
                    <span>Net Banking</span>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div
                    className={`payment-method-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <i className="bi bi-cash-stack fs-3 mb-2"></i>
                    <span>Cash on Delivery</span>
                  </div>
                </div>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="payment-form">
                  <div className="mb-3">
                    <label htmlFor="cardName" className="form-label text-black">Name on Card</label>
                    <input
                      type="text"
                      className="form-control form-control-dark"
                      id="cardName"
                      name="cardName"
                      value={paymentInfo.cardName}
                      onChange={handlePaymentChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="cardNumber" className="form-label text-black">Card Number</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-custom text-muted-custom">
                        <i className="bi bi-credit-card-2-front"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-dark"
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handlePaymentChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="expiryDate" className="form-label text-black">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control form-control-dark"
                        id="expiryDate"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handlePaymentChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="cvv" className="form-label text-black">CVV</label>
                      <input
                        type="text"
                        className="form-control form-control-dark"
                        id="cvv"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentChange}
                        placeholder="123"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-3 mt-3">
                    <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" height="30" />
                    <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" height="30" />
                    <img src="https://img.icons8.com/color/48/amex.png" alt="Amex" height="30" />
                    <img src="https://img.icons8.com/color/48/rupay.png" alt="RuPay" height="30" />
                  </div>
                </div>
              )}

              {/* UPI Payment Form */}
              {paymentMethod === 'upi' && (
                <div className="payment-form">
                  <div className="mb-3">
                    <label htmlFor="upiId" className="form-label text-black">UPI ID</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-custom text-muted-custom">
                        <i className="bi bi-phone"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control form-control-dark"
                        id="upiId"
                        name="upiId"
                        value={paymentInfo.upiId}
                        onChange={handlePaymentChange}
                        placeholder="yourname@upi"
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-3 align-items-center mt-3">
                    <span className="text-muted-custom small">Supported:</span>
                    <span className="badge bg-success">Google Pay</span>
                    <span className="badge bg-primary">PhonePe</span>
                    <span className="badge bg-info">Paytm</span>
                    <span className="badge bg-secondary">BHIM</span>
                  </div>

                  <div className="alert alert-info bg-opacity-10 border-info mt-3 mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    <small className="text-muted-custom">You will receive a payment request on your UPI app after placing the order.</small>
                  </div>
                </div>
              )}

              {/* Net Banking Form */}
              {paymentMethod === 'netbanking' && (
                <div className="payment-form">
                  <div className="mb-3">
                    <label htmlFor="bank" className="form-label text-black">Select Your Bank</label>
                    <select
                      className="form-select form-control-dark"
                      id="bank"
                      name="bank"
                      value={paymentInfo.bank}
                      onChange={handlePaymentChange}
                      required
                    >
                      <option value="">-- Select Bank --</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                      <option value="bob">Bank of Baroda</option>
                      <option value="yes">Yes Bank</option>
                      <option value="idbi">IDBI Bank</option>
                      <option value="union">Union Bank of India</option>
                    </select>
                  </div>

                  <div className="alert alert-warning bg-opacity-10 border-warning mt-3 mb-0">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <small className="text-muted-custom">You will be redirected to your bank's secure payment page.</small>
                  </div>
                </div>
              )}

              {/* Cash on Delivery */}
              {paymentMethod === 'cod' && (
                <div className="payment-form">
                  <div className="alert alert-success bg-opacity-10 border-success">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-check-circle-fill text-success fs-4 me-3"></i>
                      <div>
                        <h6 className="text-black mb-1">Cash on Delivery Selected</h6>
                        <small className="text-muted-custom">Pay when your order arrives at your doorstep</small>
                      </div>
                    </div>
                  </div>

                  <div className="card-dark bg-opacity-50 p-3 mt-3">
                    <h6 className="text-black mb-3"><i className="bi bi-info-circle me-2"></i>COD Guidelines:</h6>
                    <ul className="text-muted-custom small mb-0">
                      <li className="mb-2">Keep exact change ready for faster delivery</li>
                      <li className="mb-2">Maximum COD limit: ₹50,000</li>
                      <li className="mb-2">Valid ID may be required at delivery</li>
                      <li>Inspect product before payment</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="payment-right-col">
            <div className="payment-section-card payment-summary-card">
              <h5 className="text-black mb-4">
                <i className="bi bi-receipt me-2 text-warning"></i>Order Summary
              </h5>

              <ul className="list-unstyled mb-4">
                {cart.map((item) => (
                  <li key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary">
                    <span className="text-muted-custom">{item.name} × {item.qty}</span>
                    <span className="text-black">{formatPrice(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>

              <div className="d-flex justify-content-between py-2">
                <span className="text-muted-custom">Subtotal</span>
                <span className="text-black">{formatPrice(total)}</span>
              </div>

              <div className="d-flex justify-content-between py-2">
                <span className="text-muted-custom">Shipping</span>
                <span className="text-success">Free</span>
              </div>

              {/* Coupon Input Section */}
              <div className="py-3 border-top border-bottom border-secondary my-3">
                <label className="form-label small text-muted-custom mb-2">
                  <i className="bi bi-tag me-1"></i>Have a coupon code?
                </label>
                {appliedCoupon ? (
                  <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: '#e8f5e9', border: '1px solid #4caf50' }}>
                    <div>
                      <span className="fw-bold text-success">{appliedCoupon.code}</span>
                      <small className="d-block text-muted">{appliedCoupon.description}</small>
                    </div>
                    <button 
                      type="button"
                      className="btn btn-sm text-danger" 
                      onClick={handleRemoveCoupon}
                      title="Remove coupon"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        style={{ 
                          borderColor: couponError ? '#dc3545' : '#ddd',
                          backgroundColor: '#fff',
                          color: '#333'
                        }}
                      />
                      <button 
                        type="button"
                        className="btn btn-outline-success btn-sm" 
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                      >
                        {couponLoading ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <small className="text-danger d-block mt-1">{couponError}</small>
                    )}
                  </>
                )}
              </div>

              {appliedCoupon && (
                <div className="d-flex justify-content-between py-2">
                  <span className="text-success">
                    <i className="bi bi-tag-fill me-1"></i>
                    Discount
                  </span>
                  <span className="text-success">-{formatPrice(discount)}</span>
                </div>
              )}

              <hr className="border-secondary" />

              <div className="d-flex justify-content-between py-2 mb-4">
                <span className="text-black fw-bold">Total</span>
                <span className="text-warning fw-bold fs-5">{formatPrice(finalTotal)}</span>
              </div>

              <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className={`bi ${paymentMethod === 'cod' ? 'bi-bag-check' : 'bi-lock-fill'} me-2`}></i>
                    {paymentMethod === 'cod' ? 'Place Order' : `Pay ${formatPrice(finalTotal)}`}
                  </>
                )}
              </button>

              <p className="text-muted-custom text-center small mt-3 mb-0">
                <i className="bi bi-shield-check me-1"></i>
                {paymentMethod === 'cod' 
                  ? 'Pay cash when your order is delivered'
                  : 'Your payment is secure and encrypted'
                }
              </p>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
}

export default Payment
