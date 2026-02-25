import { Link } from 'react-router-dom'

function OrderSuccess({ order }) {
  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card-dark text-center">
            <div className="mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-check-lg text-success display-4"></i>
              </div>
            </div>

            <h2 className="text-white mb-3">Order Confirmed!</h2>

            <p className="text-muted-custom mb-4">
              Thank you for your purchase. Your order has been placed and is being processed.
            </p>

            {order && (
              <div className="bg-dark rounded p-4 mb-4">
                <div className="d-flex justify-content-between py-2 border-bottom border-secondary">
                  <span className="text-muted-custom">Order Number</span>
                  <span className="text-warning fw-bold">{order.id || '#SO-' + Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                </div>

                {order.shipping?.email && (
                  <div className="d-flex justify-content-between py-2 border-bottom border-secondary">
                    <span className="text-muted-custom">Confirmation sent to</span>
                    <span className="text-white">{order.shipping.email}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted-custom">Estimated delivery</span>
                  <span className="text-white">3-5 business days</span>
                </div>
              </div>
            )}

            <div className="d-grid mb-4">
              <Link to="/" className="btn btn-primary btn-lg">
                <i className="bi bi-bag me-2"></i>Continue Shopping
              </Link>
            </div>

            <div className="bg-dark rounded p-4 text-start">
              <h6 className="text-white mb-3">
                <i className="bi bi-info-circle me-2 text-warning"></i>What's next?
              </h6>
              <ul className="list-unstyled text-muted-custom mb-0">
                <li className="mb-2">
                  <i className="bi bi-envelope-check me-2 text-success"></i>
                  You'll receive an email confirmation shortly
                </li>
                <li className="mb-2">
                  <i className="bi bi-truck me-2 text-success"></i>
                  We'll notify you when your order ships
                </li>
                <li>
                  <i className="bi bi-geo-alt me-2 text-success"></i>
                  Track your order anytime from your account
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default OrderSuccess
