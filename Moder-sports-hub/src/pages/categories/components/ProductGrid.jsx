function ProductGrid({ title, products, onAddToCart, emptyMessage = 'No products available yet.' }) {
  return (
    <div className="card h-100 bg-dark border border-secondary-subtle shadow-sm">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="text-white mb-1">{title}</h5>
          <span className="badge rounded-pill text-bg-dark border border-secondary-subtle">
            {products.length} items
          </span>
        </div>
        <p className="text-muted-custom small mb-3">Curated picks with quick add-to-bag.</p>

        {products.length === 0 ? (
          <div className="alert alert-secondary small mb-3" role="alert">
            {emptyMessage}
          </div>
        ) : (
          <div className="d-flex flex-column gap-3 mb-3">
            {products.slice(0, 6).map((item) => (
              <div key={item.id} className="p-3 rounded-3 bg-dark-subtle d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white fw-semibold">{item.name}</div>
                  <div className="text-muted-custom small">{item.tag || item.category || 'Featured'} • ${item.price}</div>
                  {/* Show sizes for equipment */}
                  {Array.isArray(item.sizes) && item.sizes.length > 0 && (
                    <div className="mt-1">
                      <span className="badge bg-secondary me-1">Sizes:</span>
                      {item.sizes.map((sz, idx) => (
                        <span key={sz + idx} className="badge bg-dark text-white me-1">{sz}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => onAddToCart(item)}>
                  <i className="bi bi-bag me-1"></i> Add
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto d-flex gap-2 flex-wrap">
          <a className="btn btn-ghost btn-sm" href="#top">
            <i className="bi bi-arrow-up me-1"></i> Back to top
          </a>
        </div>
      </div>
    </div>
  )
}

export default ProductGrid
