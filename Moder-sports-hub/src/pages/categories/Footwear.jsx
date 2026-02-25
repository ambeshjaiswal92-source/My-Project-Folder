import ProductGrid from './components/ProductGrid'

function Footwear({ products, onAddToCart }) {
  const filtered = products.filter((p) => {
    const cat = (p.category || p.tag || '').toLowerCase()
    return cat.includes('foot') || cat.includes('shoe') || cat.includes('sneaker')
  })
  return <ProductGrid title="Footwear" products={filtered} onAddToCart={onAddToCart} emptyMessage="No footwear yet. Add items in admin." />
}

export default Footwear
