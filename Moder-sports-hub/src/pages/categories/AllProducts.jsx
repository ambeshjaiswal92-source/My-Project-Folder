import ProductGrid from './components/ProductGrid'

function AllProducts({ products, onAddToCart }) {
  return <ProductGrid title="All Products" products={products} onAddToCart={onAddToCart} />
}

export default AllProducts
