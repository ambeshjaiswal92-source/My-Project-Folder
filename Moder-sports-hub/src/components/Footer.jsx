import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer-dark">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="text-white mb-3">
              <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
              Moder Sports Hub
            </h5>
            <p className="text-muted-custom mb-4">
              Performance retail for athletes, coaches, and the teams behind them. Engineered for speed, built for the grind.
            </p>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white mb-3">Shop</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/">All Products</Link></li>
              <li className="mb-2"><Link to="/">Performance Wear</Link></li>
              <li className="mb-2"><Link to="/">Footwear</Link></li>
              <li className="mb-2"><Link to="/">Equipment</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white mb-3">Account</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/login">Login</Link></li>
              <li className="mb-2"><Link to="/register">Register</Link></li>
              <li className="mb-2"><Link to="/cart">Cart</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white mb-3">Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/support#contact">Contact Us</Link></li>
              <li className="mb-2"><Link to="/support#size-guide">Size Guide</Link></li>
              <li className="mb-2"><Link to="/support#returns">Returns</Link></li>
              <li className="mb-2"><Link to="/support#faqs">FAQs</Link></li>
            </ul>
          </div>

        </div>

        <hr className="border-custom my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="text-muted-custom mb-0 small">@ 2026 Moder Sports Hub. All rights reserved.</p>
          <div className="d-flex gap-3 small">
            
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
