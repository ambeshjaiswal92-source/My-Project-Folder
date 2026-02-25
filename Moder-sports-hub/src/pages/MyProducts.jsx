import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductContext'

function MyProducts({ wishlist, onToggleWishlist, onAddToCart }) {
  const { getActiveProducts } = useProducts()
  const products = getActiveProducts()

  const likedProducts = products.filter((p) => wishlist?.includes(p.id))

  const emptyState = (
    <div className="card-dark p-5 text-center">
      <i className="bi bi-heart text-muted-custom display-5 mb-3"></i>
      <h4 className="text-white mb-2">No liked products yet</h4>
      <p className="text-muted-custom mb-0">Tap the heart on any product to add it here.</p>
    </div>
  )

  return (
    <main className="py-5">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
          <div>
            <span className="badge badge-primary mb-2">My Products</span>
            <h2 className="text-white mb-1">Liked items</h2>
            <p className="text-muted-custom mb-0">Quickly jump back to gear you've saved.</p>
          </div>
          <div className="text-muted-custom">{likedProducts.length} saved</div>
        </div>

        {likedProducts.length === 0 ? (
          emptyState
        ) : (
          <div className="row g-4">
            {likedProducts.map((product) => (
              <div key={product.id} className="col-sm-6 col-lg-4 col-xl-3">
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  wishlist={wishlist}
                  onToggleWishlist={onToggleWishlist}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default MyProducts
