import ProductGrid from './components/ProductGrid'

function PerformanceWear({ products, onAddToCart }) {
  const filtered = products.filter((p) => {
    const cat = (p.category || p.tag || '').toLowerCase()
    return cat.includes('wear') || cat.includes('apparel') || cat.includes('performance')
  })
  return <ProductGrid title="Performance Wear" products={filtered} onAddToCart={onAddToCart} emptyMessage="No performance wear yet. Add items in admin." />
}

export default PerformanceWear
