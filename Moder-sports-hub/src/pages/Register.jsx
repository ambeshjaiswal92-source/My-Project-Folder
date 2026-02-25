import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'

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
      // Require users to sign in with their credentials after registration
      navigate('/login', { state: { registered: true, email: formData.email } })
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="auth-card register">
            <div className="text-center mb-4">
              <i className="bi bi-person-plus-fill text-warning display-4 mb-3"></i>
              <h2 className="text-white mb-2">Create Account</h2>
              <p className="text-muted-custom">Join Moder Sports Hub for exclusive drops</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label text-white">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-custom text-muted-custom">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-dark"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

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

              <div className="mb-3">
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

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label text-white">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-custom text-muted-custom">
                    <i className="bi bi-lock-fill"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control form-control-dark"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-check me-2"></i> Create Account
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-muted-custom mb-0">
                Already have an account? <Link to="/login" className="text-warning">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Register
