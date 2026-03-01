import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { adminLogin } from '../../services/api'

function AdminLogin({ onAdminLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const admin = await adminLogin({ email: formData.email, password: formData.password })
      

      // Save admin with token to localStorage (separate from user)
      localStorage.setItem('moder_admin_user', JSON.stringify(admin))
      // Also store just the token for API auth
      if (admin.token) {
        localStorage.setItem('admin_token', admin.token)
      }

      onAdminLogin({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        permissions: admin.permissions,
      })

      Swal.fire({
        icon: 'success',
        title: 'Welcome!',
        text: `Logged in as ${admin.name} (Admin)`,
        background: '#1a1a2e',
        color: '#ffffff',
        confirmButtonColor: '#ffc107',
        timer: 2000,
        timerProgressBar: true,
      }).then(() => {
        navigate('/admin')
      })
    } catch (err) {
      setError(err.message || 'Invalid admin credentials. Please check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="auth-card admin">
            <div className="text-center mb-4">
              <span className="badge bg-warning text-dark mb-3 px-3 py-2">
                <i className="bi bi-shield-lock me-2"></i>Admin Portal
              </span>
              <h2 className="text-white mb-2">Admin Sign In</h2>
              <p className="text-muted-custom">Access the Moder Sports Hub management dashboard</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label text-white">Admin Email</label>
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
                    placeholder="admin@modersports.com"
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

              <button type="submit" className="btn btn-warning w-100 btn-lg text-dark mb-3" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-speedometer2 me-2"></i>Access Dashboard
                  </>
                )}
              </button>
            </form>

            <div className="text-center mb-4">
              <Link to="/" className="text-muted-custom">
                <i className="bi bi-arrow-left me-2"></i>Back to Store
              </Link>
            </div>

            <div className="bg-dark rounded p-3 text-center">
              <p className="text-muted-custom small mb-1">Demo credentials:</p>
              <code className="text-warning">admin@modersports.com / admin123</code>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default AdminLogin
