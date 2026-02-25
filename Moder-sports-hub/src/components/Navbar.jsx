import { useMemo, useCallback, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import { sportsCategories, productTypes } from '../data/sports'

const slugify = (str = '') => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'category'

function Navbar({ cartCount = 0, user, onLogout }) {
  const navigate = useNavigate()
  const { getActiveProducts } = useProducts()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sportsExpanded, setSportsExpanded] = useState(false)
  const [navbarHidden, setNavbarHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Hide navbar on scroll down, show on scroll up (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isMobile = window.innerWidth < 992
      
      if (isMobile) {
        if (currentScrollY > lastScrollY && currentScrollY > 60) {
          // Scrolling down & past threshold
          setNavbarHidden(true)
        } else {
          // Scrolling up
          setNavbarHidden(false)
        }
      } else {
        setNavbarHidden(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const categories = useMemo(() => {
    const base = [
      { name: 'All Products', slug: '' },
      { name: 'Wear', slug: 'wear' },
      { name: 'Footwear', slug: 'footwear' },
      { name: 'Equipment', slug: 'equipment' },
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Wearable', slug: 'wearable' },
      { name: 'Gear', slug: 'gear' },
    ]

    const products = getActiveProducts()
    const map = new Map()
    base.forEach((c) => map.set(c.slug, c))
    products.forEach((p) => {
      const name = (p.category || p.tag || 'Featured').trim() || 'Featured'
      const slug = slugify(name)
      if (!map.has(slug)) map.set(slug, { name, slug })
    })
    return Array.from(map.values()).slice(0, 8)
  }, [getActiveProducts])

  // Close mobile sidebar after navigation
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
    setSportsExpanded(false)
  }, [])

  // Close mobile navbar after navigation (for desktop dropdown)
  const closeNavbar = useCallback(() => {
    const navbarCollapse = document.getElementById('navbarNav')
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      navbarCollapse.classList.remove('show')
    }
  }, [])

  const handleSportFilter = useCallback((sport) => {
    closeNavbar()
    navigate(`/products?sport=${sport}`)
  }, [navigate, closeNavbar])

  const handleTypeFilter = useCallback((type) => {
    closeNavbar()
    navigate(`/products?type=${type}`)
  }, [navigate, closeNavbar])

  const [search, setSearch] = useState("");
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      closeSidebar();
      closeNavbar();
    }
  };

  return (
    <>
      <nav 
        className={`navbar navbar-expand-lg navbar-dark-custom sticky-top ${navbarHidden ? 'navbar-hidden' : ''}`} 
        style={{ margin: 0, padding: 0 }}
      >
        <div className="container-fluid">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <span className="bg-warning rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: '32px', height: '32px' }}>
              <i className="bi bi-lightning-charge-fill text-dark" style={{ fontSize: '1rem' }}></i>
            </span>
            <span className="brand-text" style={{ 
              background: 'linear-gradient(135deg, #ffc107, #ff6b35)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              fontWeight: 'bold',
              fontSize: 'clamp(0.85rem, 3vw, 1.1rem)',
              whiteSpace: 'nowrap'
            }}>
              Moder Sports Hub
            </span>
          </Link>

          {/* Search Bar - visible on all screens, centered for desktop */}
          <form className="d-none d-lg-flex mx-auto w-50" onSubmit={handleSearch} role="search">
            <input
              className="form-control form-control-dark rounded-pill px-4"
              type="search"
              placeholder="Search products, brands, sports..."
              aria-label="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ minWidth: 200 }}
            />
            <button className="btn btn-warning ms-2 rounded-pill px-4" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </form>

          {/* Mobile: Cart + Hamburger */}
          <div className="d-flex d-lg-none align-items-center gap-1">
            <Link to="/cart" className="btn btn-ghost position-relative p-1">
              <i className="bi bi-bag" style={{ fontSize: '1.1rem' }}></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem', padding: '0.2em 0.45em' }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="navbar-toggler border-0 p-1"
              type="button"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="collapse navbar-collapse d-none d-lg-flex" id="navbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/products" className="nav-link">
                <i className="bi bi-grid me-1"></i> Products
              </Link>
            </li>
            
            {/* Sports Categories Dropdown */}
            <li className="nav-item">
              <Link to="/sports" className="nav-link" onClick={closeNavbar}>
                <i className="bi bi-trophy me-1"></i> Sports
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/support" className="nav-link">
                <i className="bi bi-headset me-1"></i> Support
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <Link to="/cart" className="btn btn-ghost position-relative">
              <i className="bi bi-bag fs-5"></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-ghost dropdown-toggle d-flex align-items-center gap-2"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle"></i>
                  {user.name}
                </button>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark">
                  <li><Link className="dropdown-item" to="/my-products">My Products</Link></li>
                  <li><Link className="dropdown-item" to="/orders">My Orders</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={onLogout}>Sign out</button></li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="btn btn-warning">
                <i className="bi bi-person me-1"></i> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Sidebar Overlay */}
    <div 
      className={`position-fixed top-0 start-0 w-100 h-100 ${sidebarOpen ? 'd-block' : 'd-none'}`}
      style={{ 
        background: 'rgba(0,0,0,0.5)', 
        zIndex: 1040,
        transition: 'opacity 0.3s'
      }}
      onClick={closeSidebar}
    ></div>

    {/* Mobile Sidebar */}
    <div 
      className="position-fixed top-0 h-100 d-lg-none"
      style={{ 
        width: '280px',
        right: sidebarOpen ? '0' : '-280px',
        background: 'linear-gradient(180deg, #0d1b2a 0%, #1b263b 100%)',
        zIndex: 1050,
        transition: 'right 0.3s ease-in-out',
        overflowY: 'auto',
        boxShadow: sidebarOpen ? '-5px 0 25px rgba(0,0,0,0.3)' : 'none'
      }}
    >
      {/* Sidebar Header */}
            {/* Offer Banner */}
            <div className="d-flex justify-content-center align-items-center my-3">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  background: 'linear-gradient(135deg, #ff6b35, #ff8533)',
                  color: '#fff',
                  borderRadius: '50px',
                  padding: '10px 24px',
                  minWidth: '120px',
                  minHeight: '36px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  boxShadow: '0 2px 12px rgba(229,57,70,0.15)',
                  position: 'relative',
                }}
              >
                <i className="bi bi-tag-fill me-2" style={{ fontSize: '1.5rem', color: '#fff', verticalAlign: 'middle' }}></i>
                <span style={{ fontSize: '1.05rem', fontWeight: 600, textTransform: 'lowercase', verticalAlign: 'middle' }}>flash sale 50% off</span>
              </div>
            </div>
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
        <span className="fw-bold text-white fs-5">
          <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
          Menu
        </span>
        <button 
          className="btn btn-ghost text-white"
          onClick={closeSidebar}
        >
          <i className="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      {/* Mobile Search */}
      <div className="p-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
        <form onSubmit={handleSearch} className="d-flex gap-2">
          <input
            className="form-control form-control-dark rounded-pill px-3"
            type="search"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-warning rounded-pill px-3" type="submit">
            <i className="bi bi-search"></i>
          </button>
        </form>
      </div>

      {/* User Section */}
      {user ? (
        <div className="p-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
              <i className="bi bi-person-fill text-dark fs-4"></i>
            </div>
            <div>
              <div className="text-white fw-semibold">{user.name}</div>
              <small className="text-muted">{user.email}</small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link to="/my-products" className="btn btn-outline-light btn-sm flex-fill" onClick={closeSidebar}>
              <i className="bi bi-box me-1"></i> My Products
            </Link>
            <Link to="/orders" className="btn btn-outline-light btn-sm flex-fill" onClick={closeSidebar}>
              <i className="bi bi-receipt me-1"></i> Orders
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
          <Link to="/login" className="btn btn-warning w-100" onClick={closeSidebar}>
            <i className="bi bi-person me-2"></i> Login / Sign Up
          </Link>
        </div>
      )}

      {/* Navigation Links */}
      <div className="py-2">
        <Link to="/" className="d-flex align-items-center gap-3 px-4 py-3 text-white text-decoration-none sidebar-link" onClick={closeSidebar}>
          <i className="bi bi-house-door fs-5" style={{ color: '#ff8533' }}></i>
          <span>Home</span>
        </Link>
        
        <Link to="/products" className="d-flex align-items-center gap-3 px-4 py-3 text-white text-decoration-none sidebar-link" onClick={closeSidebar}>
          <i className="bi bi-grid fs-5" style={{ color: '#4aa8ff' }}></i>
          <span>All Products</span>
        </Link>

        {/* Sports Expandable */}
        <div>
          <button 
            className="d-flex align-items-center justify-content-between w-100 px-4 py-3 text-white text-decoration-none sidebar-link border-0 bg-transparent"
            onClick={() => setSportsExpanded(!sportsExpanded)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-trophy fs-5" style={{ color: '#ffc107' }}></i>
              <span>Sports</span>
            </div>
            <i className={`bi ${sportsExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          </button>
          
          {sportsExpanded && (
            <div className="ps-5 pb-2" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <Link to="/sports" className="d-flex align-items-center gap-2 px-3 py-2 text-white text-decoration-none" onClick={closeSidebar}>
                🏆 All Sports
              </Link>
              {sportsCategories.slice(0, 8).map((sport) => (
                <Link 
                  key={sport.slug}
                  to={`/sports/${sport.slug}`} 
                  className="d-flex align-items-center gap-2 px-3 py-2 text-white text-decoration-none"
                  onClick={closeSidebar}
                >
                  {sport.icon} {sport.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link to="/cart" className="d-flex align-items-center gap-3 px-4 py-3 text-white text-decoration-none sidebar-link" onClick={closeSidebar}>
          <i className="bi bi-bag fs-5" style={{ color: '#ff6b35' }}></i>
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="badge bg-danger ms-auto">{cartCount}</span>
          )}
        </Link>

        <Link to="/support" className="d-flex align-items-center gap-3 px-4 py-3 text-white text-decoration-none sidebar-link" onClick={closeSidebar}>
          <i className="bi bi-headset fs-5" style={{ color: '#00d4ff' }}></i>
          <span>Support</span>
        </Link>
      </div>

      {/* Logout Button */}
      {user && (
        <div className="p-3 mt-auto border-top" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
          <button 
            className="btn btn-outline-danger w-100"
            onClick={() => {
              onLogout();
              closeSidebar();
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i> Sign Out
          </button>
        </div>
      )}
    </div>
    </>
  )
}

export default Navbar
