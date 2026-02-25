import ProductGrid from './components/ProductGrid'

function Equipment({ products, onAddToCart }) {
  const filtered = products.filter((p) => {
    const cat = (p.category || p.tag || '').toLowerCase()
    return cat.includes('gear') || cat.includes('equip') || cat.includes('ball') || cat.includes('pack')
  })
  return <ProductGrid title="Equipment" products={filtered} onAddToCart={onAddToCart} emptyMessage="No equipment yet. Add items in admin." />
}

export default Equipment
