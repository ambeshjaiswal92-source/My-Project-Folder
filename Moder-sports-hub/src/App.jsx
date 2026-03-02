import { useMemo, useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import './App.css'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// User Pages
import Home from './pages/Home'
import Products from './pages/Products'
import Sports from './pages/Sports'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import Payment from './pages/Payment'
import OrderSuccess from './pages/OrderSuccess'
import Categories from './pages/Categories'
import Support from './pages/Support'
import MyOrders from './pages/MyOrders'
import MyProducts from './pages/MyProducts'
import UserProfile from './pages/UserProfile'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'


function App() {
  const location = useLocation()
  const [user, setUser] = useState(() => {
    try {
      // Check both storage keys and sync them
      const savedUser = localStorage.getItem('moder_user')
      const savedCurrentUser = localStorage.getItem('moder_current_user')
      
      // If moder_current_user exists and has a user token (not admin), use it
      if (savedCurrentUser) {
        const currentUser = JSON.parse(savedCurrentUser)
        if (currentUser.role !== 'admin') {
          // Sync to moder_user
          localStorage.setItem('moder_user', savedCurrentUser)
          return currentUser
        }
      }
      
      // If moder_user exists, sync to moder_current_user
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        if (parsedUser.token) {
          localStorage.setItem('moder_current_user', savedUser)
        }
        return parsedUser
      }
      
      return null
    } catch {
      return null
    }
  })
  const [admin, setAdmin] = useState(null);
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [lastOrder, setLastOrder] = useState(null)

  // Persist user to localStorage (both keys for consistency)
  useEffect(() => {
    if (user) {
      const userData = JSON.stringify(user)
      localStorage.setItem('moder_user', userData)
      localStorage.setItem('moder_current_user', userData)
    } else {
      localStorage.removeItem('moder_user')
      localStorage.removeItem('moder_current_user')
    }
  }, [user])

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.qty, 0),
    [cart]
  )

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.qty, 0),
    [cart]
  )

  const addToCart = (product) => {
    // Check if user is logged in
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login or create an account to add items to your cart.',
        background: '#1a1a2e',
        color: '#ffffff',
        showCancelButton: true,
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Login',
        cancelButtonText: 'Sign Up',
        showCloseButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login'
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          window.location.href = '/register'
        }
      })
      return
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 }]
    })
    
    // Show SweetAlert toast notification
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Added to Cart!',
      html: `<span style="color: #ccc;">${product.name}</span>`,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: '#1a1a2e',
      color: '#fff',
      iconColor: '#28a745',
      customClass: {
        popup: 'border border-secondary'
      }
    })
  }

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
        )
        .filter((item) => item.qty > 0)
    )
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const handleLogin = (userData) => {
    setUser(userData)
    // Sync both storage keys immediately
    const data = JSON.stringify(userData)
    localStorage.setItem('moder_user', data)
    localStorage.setItem('moder_current_user', data)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('moder_user')
    localStorage.removeItem('moder_current_user')
  }

  const handleOrderComplete = (order) => {
    setLastOrder(order)
    setCart([])
  }

  const handleAdminLogin = (adminData) => {
    setAdmin(adminData)
  }

  const handleAdminLogout = () => {
    setAdmin(null)
    localStorage.removeItem('moder_admin_user')
  }

  // Check if on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAdminLogin = location.pathname === '/admin-login'

  // Render Admin Layout (no navbar/footer)
  if (isAdminRoute && admin) {
    return (
      <Routes>
        <Route
          path="/admin/*"
          element={<AdminDashboard admin={admin} onLogout={handleAdminLogout} />}
        />
      </Routes>
    )
  }

  // Render User Layout
  return (
    <div className="app">
      {!isAdminLogin && <Navbar cartCount={cartCount} user={user} onLogout={handleLogout} />}

      <Routes>
        <Route
          path="/"
          element={<Home onAddToCart={addToCart} wishlist={wishlist} onToggleWishlist={toggleWishlist} />}
        />
        <Route
          path="/products"
          element={<Products onAddToCart={addToCart} wishlist={wishlist} onToggleWishlist={toggleWishlist} />}
        />
        <Route
          path="/sports"
          element={<Sports onAddToCart={addToCart} wishlist={wishlist} onToggleWishlist={toggleWishlist} />}
        />
        <Route
          path="/sports/:sportSlug"
          element={<Sports onAddToCart={addToCart} wishlist={wishlist} onToggleWishlist={toggleWishlist} />}
        />
        <Route
          path="/product/:id"
          element={<ProductDetail onAddToCart={addToCart} wishlist={wishlist} onToggleWishlist={toggleWishlist} user={user} />}
        />
        <Route path="/categories" element={<Categories onAddToCart={addToCart} />} />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/" replace /> : <Register onLogin={handleLogin} />
          }
        />
        <Route
          path="/cart"
          element={
            user ? (
              <Cart
                cart={cart}
                updateQty={updateQty}
                removeFromCart={removeFromCart}
                total={cartTotal}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/payment"
          element={
            user ? (
              <Payment
                cart={cart}
                total={cartTotal}
                user={user}
                onOrderComplete={handleOrderComplete}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/support" element={<Support />} />
        <Route
          path="/order-success"
          element={user ? <OrderSuccess order={lastOrder} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/orders"
          element={user ? <MyOrders user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/my-products"
          element={user ? <MyProducts wishlist={wishlist} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={user ? <UserProfile userId={user.id || user._id} token={user.token} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin-login"
          element={admin ? <Navigate to="/admin" replace /> : <AdminLogin onAdminLogin={handleAdminLogin} />}
        />
        <Route
          path="/admin/*"
          element={
            admin ? (
              <AdminDashboard admin={admin} onLogout={handleAdminLogout} />
            ) : (
              <Navigate to="/admin-login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdminLogin && <Footer />}
    </div>
  )
}

export default App
