import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/api'
import Swal from 'sweetalert2'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (location.state?.registered) {
      setInfo('Account created. Please sign in with your email and password.')
    }
  }, [location.state])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await loginUser({ email: formData.email, password: formData.password })
      
      // Save user with token to localStorage
      localStorage.setItem('moder_current_user', JSON.stringify(user))
      
      onLogin(user)
      setLoading(false)
      
      // Show SweetAlert success message
      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: `Hello ${user.name || user.email}! You have successfully logged in.`,
        background: '#1a1a2e',
        color: '#ffffff',
        confirmButtonColor: '#667eea',
        confirmButtonText: 'Continue Shopping',
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      }).then(() => {
        navigate('/')
      })
    } catch (err) {
      setError(err.message || 'Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <main className="min-vh-100 d-flex" style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%)' }}>
      {/* Left Side - Branding */}
      <div className="d-none d-lg-flex flex-column justify-content-center align-items-center w-50 p-5 position-relative" 
           style={{ 
             background: 'linear-gradient(135deg, #ff8533 0%, #ffc107 50%, #ff6b35 100%)',
             overflow: 'hidden'
           }}>
        {/* Decorative shapes */}
        <div className="position-absolute" style={{ top: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
        <div className="position-absolute" style={{ bottom: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
        <div className="position-absolute" style={{ top: '40%', right: '10%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}></div>
        
        <div className="text-center position-relative z-1">
          <div className="mb-4">
            <span className="bg-dark rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
              <i className="bi bi-lightning-charge-fill text-warning" style={{ fontSize: '3rem' }}></i>
            </span>
          </div>
          <h1 className="display-4 fw-bold text-dark mb-3">Modern Sports Hub</h1>
          <p className="lead text-dark mb-4" style={{ opacity: 0.8 }}>Your one-stop destination for premium sports gear</p>
          <div className="d-flex justify-content-center gap-4 mb-4">
            <div className="text-center">
              <i className="bi bi-truck fs-2 text-dark mb-2"></i>
              <p className="text-dark small mb-0">Free Shipping</p>
            </div>
            <div className="text-center">
              <i className="bi bi-shield-check fs-2 text-dark mb-2"></i>
              <p className="text-dark small mb-0">Secure Payment</p>
            </div>
            <div className="text-center">
              <i className="bi bi-arrow-repeat fs-2 text-dark mb-2"></i>
              <p className="text-dark small mb-0">Easy Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="d-flex flex-column justify-content-center align-items-center w-100 w-lg-50 p-4 p-md-5">
        <div className="w-100" style={{ maxWidth: '420px' }}>
          {/* Mobile Logo */}
          <div className="text-center mb-4 d-lg-none">
            <span className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
              <i className="bi bi-lightning-charge-fill text-dark" style={{ fontSize: '2rem' }}></i>
            </span>
          </div>

          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2" style={{ color: '#fff', fontSize: '2rem' }}>Welcome Back</h2>
            <p style={{ color: '#94a3b8' }}>Sign in to continue to your account</p>
          </div>

          {info && (
            <div className="alert d-flex align-items-center mb-4" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', color: '#22c55e' }}>
              <i className="bi bi-check-circle-fill me-2"></i>
              {info}
            </div>
          )}

          {error && (
            <div className="alert d-flex align-items-center mb-4" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#ef4444' }}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-medium" style={{ color: '#e2e8f0' }}>Email Address</label>
              <div className="position-relative">
                <i className="bi bi-envelope position-absolute" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
                <input
                  type="email"
                  className="form-control py-3 ps-5"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium" style={{ color: '#e2e8f0' }}>Password</label>
              <div className="position-relative">
                <i className="bi bi-lock position-absolute" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control py-3 ps-5 pe-5"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
                <button
                  type="button"
                  className="btn position-absolute border-0 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', background: 'transparent' }}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn w-100 py-3 fw-semibold mb-4" 
              disabled={loading}
              style={{ 
                background: 'linear-gradient(135deg, #ff8533, #ffc107)',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(255, 133, 51, 0.4)'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <i className="bi bi-arrow-right ms-2"></i>
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p style={{ color: '#94a3b8' }}>
              Don't have an account? <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: '#ffc107' }}>Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Login
