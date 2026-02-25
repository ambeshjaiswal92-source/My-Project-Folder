import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import { Routes, Route, Navigate } from 'react-router-dom'
import AllProducts from './categories/AllProducts'
import PerformanceWear from './categories/PerformanceWear'
import Footwear from './categories/Footwear'
import Equipment from './categories/Equipment'

const slugify = (str = '') => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'category'

function Categories({ onAddToCart }) {
  const { getActiveProducts } = useProducts()
  const products = getActiveProducts()

  const grouped = useMemo(() => {
    if (!products.length) {
      return [
        {
          name: 'Performance Wear',
          blurb: 'Quick-dry tops, compression layers, and breathable outerwear built for training heat.',
          items: [],
        },
        {
          name: 'Footwear Lab',
          blurb: 'Responsive road runners, court traction, and all-terrain grip for every discipline.',
          items: [],
        },
        {
          name: 'Gear & Equipment',
          blurb: 'Match-ready balls, training cones, smart wearables, and protective essentials.',
          items: [],
        },
      ]
    }

    const map = new Map()
    products.forEach((p) => {
      const name = (p.category || p.tag || 'Featured').trim() || 'Featured'
      const slug = slugify(name)
      if (!map.has(slug)) {
        map.set(slug, { name, slug, blurb: p.description || 'Performance-built essentials.', items: [] })
      }
      map.get(slug).items.push(p)
    })

    return Array.from(map.values()).sort((a, b) => b.items.length - a.items.length)
  }, [products])

  const navItems = [
    { name: 'All Products', slug: 'all' },
    { name: 'Performance Wear', slug: 'performance-wear' },
    { name: 'Footwear', slug: 'footwear' },
    { name: 'Equipment', slug: 'equipment' },
  ]

  return (
    <main className="py-5">
      <section className="container mb-5">
        <div className="row align-items-center gy-4">
          <div className="col-lg-7">
            <span className="badge badge-primary mb-3">Shop by focus</span>
            <h1 className="text-white mb-3">Categories tuned for every discipline.</h1>
            <p className="text-muted-custom lead mb-4">
              Jump into curated stacks for runners, hoopers, lifters, and outdoor crews. Browse by category, then add-to-bag from
              the highlights without losing your place.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/" className="btn btn-primary">
                <i className="bi bi-bag me-2"></i> Back to shop
              </Link>
              <Link to="/cart" className="btn btn-ghost">
                <i className="bi bi-basket2 me-2"></i> Go to cart
              </Link>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card bg-dark border border-secondary-subtle shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="badge bg-warning text-dark me-2">New</div>
                  <span className="text-muted-custom">Fast browsing, quick adds</span>
                </div>
                <h5 className="text-white mb-3">Loadouts built for your sessions</h5>
                <p className="text-muted-custom mb-0">
                  Save time by shopping per focus area. We keep sizing, stock, and pricing visible, so you can fill the bag in a few clicks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-3">
            <div className="list-group">
              {navItems.map((item) => (
                <Link key={item.slug} className="list-group-item list-group-item-action" to={item.slug === 'all' ? '.' : item.slug} replace>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="col-lg-9">
            <div className="row g-4">
              <Routes>
                <Route index element={<AllProducts products={products} onAddToCart={onAddToCart} />} />
                <Route path="performance-wear" element={<PerformanceWear products={products} onAddToCart={onAddToCart} />} />
                <Route path="footwear" element={<Footwear products={products} onAddToCart={onAddToCart} />} />
                <Route path="equipment" element={<Equipment products={products} onAddToCart={onAddToCart} />} />
                <Route path="*" element={<Navigate to="." replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Categories
