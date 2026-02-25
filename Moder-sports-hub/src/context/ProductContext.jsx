
import { createContext, useContext, useState, useEffect } from 'react'
import { getProducts as fetchProductsFromAPI, createProduct as createProductAPI, updateProduct as updateProductAPI, deleteProduct as deleteProductAPI } from '../services/api'

const STORAGE_KEY = 'moder_products'
const STORAGE_VERSION_KEY = 'moder_products_version'
const STORAGE_BACKUP_KEY = 'moder_products_backup'
const STORAGE_LOCK_KEY = 'moder_products_locked'
const STORAGE_RANDOM_VERSION_KEY = 'moder_products_random_version'
const DATA_VERSION = 'v6-no-default-catalog'
const RANDOM_DATA_VERSION = 'r6-no-default-catalog-2026-01-24'

const placeholders = [
  'https://images.unsplash.com/photo-1528701800489-20be9f964f9f',
  'https://images.unsplash.com/photo-1542293787938-4d363b6c2354',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
]

const defaultProducts = [
  {
    id: 'default-1',
    name: 'AeroFlex Match Tee',
    price: 1299,
    originalPrice: 1599,
    category: 'Performance Wear',
    tag: 'Performance',
    badge: 'Bestseller',
    status: 'Active',
    stock: 45,
    sport: 'Running',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=640&q=80',
    description: 'Lightweight, breathable running tee designed for maximum comfort during intense workouts.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Navy'],
    gender: 'Unisex',
  },
  {
    id: 'default-2',
    name: 'Momentum Gym Hoodie',
    price: 2499,
    originalPrice: 2999,
    category: 'Performance Wear',
    tag: 'Performance',
    badge: 'All-weather',
    status: 'Active',
    stock: 32,
    sport: 'Gym',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=640&q=80',
    description: 'Premium gym hoodie with moisture-wicking fabric for training in any weather condition.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gray', 'Black', 'Blue'],
    gender: 'Unisex',
  },
  {
    id: 'default-3',
    name: 'HyperCourt Basketball Shoes',
    price: 4999,
    originalPrice: 5999,
    category: 'Footwear',
    tag: 'Footwear',
    badge: 'Court Grip',
    status: 'Active',
    stock: 28,
    sport: 'Basketball',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=640&q=80',
    description: 'Professional basketball shoes with superior grip and ankle support for competitive play.',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['White/Red', 'Black/Gold', 'Blue/White'],
    gender: 'Unisex',
  },
  {
    id: 'default-4',
    name: 'Summit Cycling Pack',
    price: 3499,
    originalPrice: 4199,
    category: 'Equipment',
    tag: 'Gear',
    badge: 'Hydration Ready',
    status: 'Active',
    stock: 20,
    sport: 'Cycling',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=640&q=80',
    description: 'Durable cycling backpack with hydration compatibility and multiple storage compartments.',
    sizes: ['One Size'],
    colors: ['Black', 'Olive', 'Orange'],
    gender: 'Unisex',
  },
  {
    id: 'default-5',
    name: 'Velocity Running Pants',
    price: 1899,
    originalPrice: 2299,
    category: 'Performance Wear',
    tag: 'Performance',
    badge: '4-way Stretch',
    status: 'Active',
    stock: 55,
    sport: 'Running',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=640&q=80',
    description: 'Flexible running pants with 4-way stretch technology for unrestricted movement.',
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
    colors: ['Black', 'Navy', 'Gray'],
    gender: 'Unisex',
  },
  {
    id: 'default-6',
    name: 'Pulse Fitness Watch',
    price: 8999,
    originalPrice: 10999,
    category: 'Accessories',
    tag: 'Wearable',
    badge: 'VO₂ Insights',
    status: 'Active',
    stock: 15,
    sport: 'Gym',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=640&q=80',
    description: 'Advanced fitness smartwatch with heart rate monitoring, GPS, and VO2 max tracking.',
    sizes: ['One Size'],
    colors: ['Black', 'Silver', 'Rose Gold'],
    gender: 'Unisex',
  },
  {
    id: 'default-7',
    name: 'Football Training Jersey',
    price: 1799,
    originalPrice: 2199,
    category: 'Performance Wear',
    tag: 'Performance',
    badge: 'Dri-Fit',
    status: 'Active',
    stock: 40,
    sport: 'Football',
    image: 'https://images.unsplash.com/photo-1580087256394-dc596e1c8f4f?auto=format&fit=crop&w=640&q=80',
    description: 'Breathable football jersey with moisture-wicking technology for match days.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Red', 'Blue', 'White'],
    gender: 'Men',
  },
  {
    id: 'default-8',
    name: 'Cricket Batting Gloves',
    price: 1499,
    originalPrice: 1899,
    category: 'Equipment',
    tag: 'Gear',
    badge: 'Pro Grade',
    status: 'Active',
    stock: 25,
    sport: 'Cricket',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=640&q=80',
    description: 'Professional cricket batting gloves with superior grip and protection.',
    sizes: ['S', 'M', 'L'],
    colors: ['White', 'Blue'],
    gender: 'Unisex',
  },
  {
    id: 'default-9',
    name: 'Tennis Pro Racket',
    price: 6999,
    originalPrice: 8499,
    category: 'Equipment',
    tag: 'Equipment',
    badge: 'Tournament',
    status: 'Active',
    stock: 15,
    sport: 'Tennis',
    image: 'https://images.unsplash.com/photo-1617083934555-ac7d4a8bb7ce?auto=format&fit=crop&w=640&q=80',
    description: 'Professional tennis racket with carbon fiber frame for power and precision.',
    sizes: ['One Size'],
    colors: ['Black/Red', 'White/Blue'],
    gender: 'Unisex',
  },
  {
    id: 'default-10',
    name: 'Yoga Mat Premium',
    price: 1299,
    originalPrice: 1599,
    category: 'Equipment',
    tag: 'Yoga',
    badge: 'Eco-Friendly',
    status: 'Active',
    stock: 60,
    sport: 'Yoga',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=640&q=80',
    description: 'Premium eco-friendly yoga mat with non-slip surface and cushioned support.',
    sizes: ['One Size'],
    colors: ['Purple', 'Blue', 'Green', 'Black'],
    gender: 'Unisex',
  },
  {
    id: 'default-11',
    name: 'Swimming Goggles Pro',
    price: 899,
    originalPrice: 1199,
    category: 'Accessories',
    tag: 'Swimming',
    badge: 'Anti-Fog',
    status: 'Active',
    stock: 35,
    sport: 'Swimming',
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=640&q=80',
    description: 'Professional swimming goggles with anti-fog coating and UV protection.',
    sizes: ['One Size'],
    colors: ['Black', 'Blue', 'Clear'],
    gender: 'Unisex',
  },
  {
    id: 'default-12',
    name: 'Cycling Jersey Elite',
    price: 2299,
    originalPrice: 2799,
    category: 'Performance Wear',
    tag: 'Performance',
    badge: 'Aero Fit',
    status: 'Active',
    stock: 22,
    sport: 'Cycling',
    image: 'https://images.unsplash.com/photo-1565685019-77d5c900ad70?auto=format&fit=crop&w=640&q=80',
    description: 'Aerodynamic cycling jersey with rear pockets and moisture management.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Yellow', 'Black', 'Red'],
    gender: 'Unisex',
  },
]

const lockedProducts = []

const stripSeedProducts = (list) =>
  list.filter((p) => {
    const id = String(p.id || '')
    return !id.startsWith('seed-') && !id.startsWith('seed-r-')
  })

const randomFrom = (list) => list[Math.floor(Math.random() * list.length)]

// Size options by category type
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const SHOE_SIZES = ['6', '7', '8', '9', '10', '11', '12']
const PANT_SIZES = ['28', '30', '32', '34', '36', '38', '40']
const ONE_SIZE = ['One Size']

const getSizesForCategory = (category, productName = '') => {
  const cat = (category || '').toLowerCase()
  const name = (productName || '').toLowerCase()
  
  // Check for footwear first
  if (cat.includes('footwear') || cat.includes('shoe') || cat.includes('sneaker') || cat.includes('boot')) {
    return SHOE_SIZES
  }
  
  // Check for pants/shorts/trousers (waist sizes)
  if (cat.includes('pant') || cat.includes('trouser') || cat.includes('jean') || cat.includes('short') ||
      name.includes('pant') || name.includes('trouser') || name.includes('jean') || name.includes('short')) {
    return PANT_SIZES
  }
  
  // Check for other clothing (letter sizes)
  if (cat.includes('wear') || cat.includes('cloth') || cat.includes('apparel') || 
      cat.includes('tee') || cat.includes('shirt') || cat.includes('hoodie') || cat.includes('jacket')) {
    return CLOTHING_SIZES
  }
  
  // Equipment and accessories
  if (cat.includes('equipment') || cat.includes('gear') || cat.includes('wearable') || 
      cat.includes('accessori') || cat.includes('bag') || cat.includes('pack') || cat.includes('watch')) {
    return ONE_SIZE
  }
  
  return CLOTHING_SIZES // default to clothing sizes
}

const normalizeProduct = (product, idx = 0) => {
  const img = product.image || `${placeholders[idx % placeholders.length]}?auto=format&fit=crop&w=640&q=80`
  const status = product.status || 'Active'
  const price = Number(product.price ?? 50)
  const stock = Number.isFinite(product.stock) ? product.stock : 25
  const category = product.category || 'Performance Wear'
  
  // Use product's sizes if provided, otherwise determine based on category and name
  const sizes = Array.isArray(product.sizes) && product.sizes.length
    ? product.sizes
    : getSizesForCategory(category, product.name)
  
  const colors = Array.isArray(product.colors) && product.colors.length
    ? product.colors
    : ['Black', 'White']
  return {
    badge: product.badge || 'New',
    description: product.description || 'Performance-built gear tuned for your sessions.',
    originalPrice: product.originalPrice || Math.round(price * 1.2) || price,
    ...product,
    category,
    status,
    price,
    stock,
    image: img,
    sizes,
    colors,
    gender: product.gender || 'Unisex',
    tag: product.tag || category || 'Featured',
  }
}

const ProductContext = createContext()

const loadProducts = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const backup = localStorage.getItem(STORAGE_BACKUP_KEY)

    const parseList = (json) => {
      if (!json) return null
      const parsed = JSON.parse(json)
      return Array.isArray(parsed) ? parsed : null
    }

    const primary = parseList(saved)
    const fallback = parseList(backup)
    
    // Use saved products from localStorage (will be replaced by backend on mount)
    let base = primary || fallback || []
    
    const normalized = base.map((p, idx) => normalizeProduct(p, idx))
    return normalized
  } catch (e) {
    console.error('Error loading products:', e)
    return []
  }
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => loadProducts())

  const saveProducts = (list) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify(list))
    localStorage.setItem(STORAGE_VERSION_KEY, DATA_VERSION)
    localStorage.setItem(STORAGE_LOCK_KEY, '1')
    localStorage.setItem(STORAGE_RANDOM_VERSION_KEY, RANDOM_DATA_VERSION)
  }

  // Fetch products from backend API on mount
  useEffect(() => {
    const fetchFromBackend = async () => {
      try {
        const backendProducts = await fetchProductsFromAPI()
        // Use ONLY backend products - replace all local/default products
        const normalized = (backendProducts || []).map((p, idx) => normalizeProduct({
          ...p,
          id: p._id || p.id || `backend-${idx}`,
        }, idx))
        
        console.log(`Loaded ${normalized.length} products from backend`)
        setProducts(normalized)
        saveProducts(normalized)
      } catch (error) {
        console.log('Could not fetch products from backend, using local data:', error.message)
      }
    }
    
    fetchFromBackend()
  }, [])

  useEffect(() => {
    console.log('Saving products to localStorage:', products)
    saveProducts(products)
  }, [products])

  const getActiveProducts = () => {
    const active = products.filter((p) => {
      const status = (p.status || 'Active').toLowerCase().replace(/\s+/g, '-')
      // Include active, low-stock, and any status that isn't explicitly out-of-stock or inactive
      const isActive = status === 'active' || 
                       status === 'low-stock' || 
                       status === 'lowstock' ||
                       status === 'low stock' ||
                       (!status.includes('out') && !status.includes('inactive') && !status.includes('draft'))
      return isActive
    })
    console.log('Active products:', active.length, 'of', products.length)
    return active
  }

  const getAllProducts = () => products

  const getProductById = (id) => products.find((p) => p.id === id)

  const addProduct = async (productData) => {
    // Determine status based on stock if not provided
    let status = productData.status || 'Active'
    const stock = Number(productData.stock || 0)
    if (stock <= 0) status = 'Out of Stock'
    else if (stock <= 25 && status === 'Active') status = 'Low Stock'
    else if (stock > 25) status = 'Active'
    
    const productToCreate = {
      ...productData,
      status: status,
      badge: productData.badge || 'New',
      tag: productData.tag || productData.category,
      sizes: productData.sizes || ['S', 'M', 'L', 'XL'],
      colors: productData.colors || ['Black', 'White'],
      description: productData.description || 'High-quality sports product designed for peak performance.',
    }
    
    console.log('Adding new product:', productToCreate.name, 'Status:', productToCreate.status)
    
    // Try to create in backend first
    let newProduct
    try {
      const backendProduct = await createProductAPI(productToCreate)
      newProduct = normalizeProduct({
        ...backendProduct,
        id: backendProduct._id || backendProduct.id,
      })
      console.log('Product created in backend:', newProduct.id)
    } catch (error) {
      console.error('Failed to create product in backend:', error.message)
      // Re-throw the error so the caller can handle it
      throw new Error(`Failed to save product: ${error.message}`)
    }
    
    setProducts((prev) => {
      const updated = [...prev, newProduct]
      saveProducts(updated)
      return updated
    })
    return newProduct
  }

  const addRandomProduct = () => {
    const categories = [
      { category: 'Performance Wear', tag: 'Performance' },
      { category: 'Footwear', tag: 'Footwear' },
      { category: 'Equipment', tag: 'Equipment' },
    ]
    const wearNames = ['Aero Mesh Tee', 'Pulse Zip Hoodie', 'Flex Stride Short', 'Therma Layer Crew']
    const shoeNames = ['StrideFuel Runner', 'CourtLock Sneaker', 'TrailEdge Boot', 'Tempo Sprint Spike']
    const gearNames = ['Hydra Flask Pro', 'Agility Ladder Set', 'Power Band Trio', 'Impact Guard Kit']

    const pick = randomFrom(categories)
    const namePool = pick.category === 'Performance Wear' ? wearNames : pick.category === 'Footwear' ? shoeNames : gearNames
    const price = Math.floor(Math.random() * 120) + 35
    const stock = Math.floor(Math.random() * 60) + 20

    return addProduct({
      name: randomFrom(namePool),
      price,
      category: pick.category,
      tag: pick.tag,
      status: 'Active',
      stock,
      description: 'Auto-generated product for quick seeding.',
    })
  }

  const updateProduct = async (id, productData) => {
    console.log('Updating product:', id, productData)
    
    // Try to update in backend
    try {
      await updateProductAPI(id, productData)
      console.log('Product updated in backend')
    } catch (error) {
      console.error('Failed to update product in backend:', error.message)
      throw new Error(`Failed to update product: ${error.message}`)
    }
    
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...productData } : p))
      // Immediately persist
      saveProducts(updated)
      return updated
    })
  }

  const deleteProduct = async (id) => {
    console.log('Deleting product:', id)
    
    // Try to delete from backend first
    try {
      await deleteProductAPI(id)
      console.log('Product deleted from backend')
    } catch (error) {
      console.error('Failed to delete product from backend:', error.message)
      throw new Error(`Failed to delete product: ${error.message}`)
    }
    
    // Also delete from local state
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id)
      saveProducts(updated)
      return updated
    })
  }

  const updateStock = (id, quantity) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = p.stock + quantity
          let status = p.status
          if (newStock <= 0) status = 'Out of Stock'
          else if (newStock <= 25) status = 'Low Stock'
          else status = 'Active'
          return { ...p, stock: Math.max(0, newStock), status }
        }
        return p
      })
    )
  }

  // Refresh products from backend
  const refreshProducts = async () => {
    try {
      const backendProducts = await fetchProductsFromAPI()
      const normalized = (backendProducts || []).map((p, idx) => normalizeProduct({
        ...p,
        id: p._id || p.id || `backend-${idx}`,
      }, idx))
      
      console.log(`Refreshed ${normalized.length} products from backend`)
      setProducts(normalized)
      saveProducts(normalized)
      return normalized
    } catch (error) {
      console.log('Could not refresh products:', error.message)
      return products
    }
  }

  const value = {
    products,
    getActiveProducts,
    getAllProducts,
    getProductById,
    addProduct,
    addRandomProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    refreshProducts,
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider')
  }
  return context
}

export default ProductContext
