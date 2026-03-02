import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'
import Swal from 'sweetalert2'

function Register({ onLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      
      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'Please sign in with your credentials',
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#ffc107',
        timer: 2000,
        timerProgressBar: true
      })
      
      navigate('/login', { state: { registered: true, email: formData.email } })
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!formData.password) return { strength: 0, text: '', color: '' }
    let strength = 0
    if (formData.password.length >= 6) strength++
    if (formData.password.length >= 8) strength++
    if (/[A-Z]/.test(formData.password)) strength++
    if (/[0-9]/.test(formData.password)) strength++
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++
    
    if (strength <= 2) return { strength: strength * 20, text: 'Weak', color: '#ef4444' }
    if (strength <= 3) return { strength: strength * 20, text: 'Medium', color: '#f59e0b' }
    return { strength: strength * 20, text: 'Strong', color: '#22c55e' }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <main className="min-vh-100 d-flex" style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%)' }}>
      {/* Left Side - Form */}
      <div className="d-flex flex-column justify-content-center align-items-center w-100 w-lg-50 p-4 p-md-5" style={{ order: 2 }}>
        <div className="w-100" style={{ maxWidth: '420px' }}>
          {/* Mobile Logo */}
          <div className="text-center mb-4 d-lg-none">
            <span className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
              <i className="bi bi-person-plus-fill text-dark" style={{ fontSize: '2rem' }}></i>
            </span>
          </div>

          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2" style={{ color: '#fff', fontSize: '2rem' }}>Create Account</h2>
            <p style={{ color: '#94a3b8' }}>Join Modern Sports Hub today</p>
          </div>

          {error && (
            <div className="alert d-flex align-items-center mb-4" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#ef4444' }}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#e2e8f0' }}>Full Name</label>
              <div className="position-relative">
                <i className="bi bi-person position-absolute" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
                <input
                  type="text"
                  className="form-control py-3 ps-5"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
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

            <div className="mb-3">
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

            <div className="mb-3">
              <label className="form-label fw-medium" style={{ color: '#e2e8f0' }}>Password</label>
              <div className="position-relative">
                <i className="bi bi-lock position-absolute" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control py-3 ps-5 pe-5"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
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
              {formData.password && (
                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small style={{ color: '#94a3b8' }}>Password strength</small>
                    <small style={{ color: passwordStrength.color }}>{passwordStrength.text}</small>
                  </div>
                  <div className="progress" style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                    <div 
                      className="progress-bar" 
                      style={{ width: `${passwordStrength.strength}%`, background: passwordStrength.color, transition: 'all 0.3s' }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium" style={{ color: '#e2e8f0' }}>Confirm Password</label>
              <div className="position-relative">
                <i className="bi bi-lock-fill position-absolute" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control py-3 ps-5 pe-5"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: `1px solid ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'}`, 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
                <button
                  type="button"
                  className="btn position-absolute border-0 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', background: 'transparent' }}
                >
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <small className="text-danger mt-1 d-block">
                  <i className="bi bi-x-circle me-1"></i>Passwords don't match
                </small>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                <small style={{ color: '#22c55e' }} className="mt-1 d-block">
                  <i className="bi bi-check-circle me-1"></i>Passwords match
                </small>
              )}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <i className="bi bi-arrow-right ms-2"></i>
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p style={{ color: '#94a3b8' }}>
              Already have an account? <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: '#ffc107' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="d-none d-lg-flex flex-column justify-content-center align-items-center w-50 p-5 position-relative" 
           style={{ 
             background: 'linear-gradient(135deg, #ffc107 0%, #ff8533 50%, #ff6b35 100%)',
             overflow: 'hidden',
             order: 1
           }}>
        {/* Decorative shapes */}
        <div className="position-absolute" style={{ top: '-80px', right: '-80px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
        <div className="position-absolute" style={{ bottom: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
        <div className="position-absolute" style={{ top: '30%', left: '15%', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}></div>
        
        <div className="text-center position-relative z-1">
          <div className="mb-4">
            <span className="bg-dark rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
              <i className="bi bi-person-plus-fill text-warning" style={{ fontSize: '3rem' }}></i>
            </span>
          </div>
          <h1 className="display-4 fw-bold text-dark mb-3">Join Us Today</h1>
          <p className="lead text-dark mb-4" style={{ opacity: 0.8 }}>Get access to exclusive deals and new arrivals</p>
          <div className="d-flex flex-column gap-3 align-items-start mx-auto" style={{ maxWidth: '280px' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-dark bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-percent text-dark"></i>
              </div>
              <span className="text-dark fw-medium">Exclusive member discounts</span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-dark bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-bell text-dark"></i>
              </div>
              <span className="text-dark fw-medium">Early access to new drops</span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-dark bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-gift text-dark"></i>
              </div>
              <span className="text-dark fw-medium">Birthday rewards & offers</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Register
