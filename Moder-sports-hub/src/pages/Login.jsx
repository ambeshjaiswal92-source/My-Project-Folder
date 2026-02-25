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
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="auth-card login">
            <div className="text-center mb-4">
              <i className="bi bi-lightning-charge-fill text-warning display-4 mb-3"></i>
              <h2 className="text-white mb-2">Welcome Back</h2>
              <p className="text-muted-custom">Sign in to your Moder Sports Hub account</p>
            </div>

            {info && (
              <div className="alert alert-success d-flex align-items-center" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                {info}
              </div>
            )}

            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label text-white">Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-custom text-muted-custom">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control form-control-dark"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label text-white">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-custom text-muted-custom">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control form-control-dark"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 btn-lg mb-3" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-muted-custom mb-0">
                Don't have an account? <Link to="/register" className="text-warning">Create one</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Login
