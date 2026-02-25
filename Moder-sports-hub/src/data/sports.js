// Sports Categories Data
// Centralized sports configuration for the entire application

export const sportsCategories = [
  {
    id: 'football',
    name: 'Football',
    slug: 'football',
    icon: '⚽',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=640&q=80',
    description: 'Football gear, boots, jerseys, and training equipment',
    keywords: ['football', 'soccer', 'boot', 'cleat', 'jersey', 'shin guard'],
    relatedProducts: ['footwear', 'performance-wear', 'equipment', 'accessories'],
  },
  {
    id: 'basketball',
    name: 'Basketball',
    slug: 'basketball',
    icon: '🏀',
    image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=640&q=80',
    description: 'Basketball shoes, jerseys, balls, and training gear',
    keywords: ['basketball', 'hoop', 'court', 'dunk', 'sneaker'],
    relatedProducts: ['footwear', 'performance-wear', 'equipment', 'accessories'],
  },
  {
    id: 'cricket',
    name: 'Cricket',
    slug: 'cricket',
    icon: '🏏',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=640&q=80',
    description: 'Cricket bats, pads, helmets, and protective gear',
    keywords: ['cricket', 'bat', 'pad', 'helmet', 'wicket', 'glove'],
    relatedProducts: ['equipment', 'accessories', 'performance-wear', 'footwear'],
  },
  {
    id: 'running',
    name: 'Running',
    slug: 'running',
    icon: '🏃',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=640&q=80',
    description: 'Running shoes, athletic wear, and performance accessories',
    keywords: ['running', 'jogging', 'marathon', 'sprint', 'track'],
    relatedProducts: ['footwear', 'performance-wear', 'accessories', 'wearable'],
  },
  {
    id: 'tennis',
    name: 'Tennis',
    slug: 'tennis',
    icon: '🎾',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=640&q=80',
    description: 'Tennis rackets, balls, shoes, and court apparel',
    keywords: ['tennis', 'racket', 'court', 'serve', 'volley'],
    relatedProducts: ['equipment', 'footwear', 'performance-wear', 'accessories'],
  },
  {
    id: 'gym',
    name: 'Gym & Fitness',
    slug: 'gym',
    icon: '🏋️',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=640&q=80',
    description: 'Gym equipment, workout clothes, and fitness accessories',
    keywords: ['gym', 'fitness', 'workout', 'training', 'weights', 'dumbbell'],
    relatedProducts: ['equipment', 'performance-wear', 'accessories', 'gear'],
  },
  {
    id: 'swimming',
    name: 'Swimming',
    slug: 'swimming',
    icon: '🏊',
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=640&q=80',
    description: 'Swimwear, goggles, caps, and pool accessories',
    keywords: ['swimming', 'swim', 'pool', 'goggle', 'cap', 'aqua'],
    relatedProducts: ['performance-wear', 'accessories', 'gear'],
  },
  {
    id: 'cycling',
    name: 'Cycling',
    slug: 'cycling',
    icon: '🚴',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=640&q=80',
    description: 'Cycling gear, helmets, jerseys, and bike accessories',
    keywords: ['cycling', 'bike', 'bicycle', 'helmet', 'pedal'],
    relatedProducts: ['accessories', 'performance-wear', 'gear', 'equipment'],
  },
  {
    id: 'yoga',
    name: 'Yoga',
    slug: 'yoga',
    icon: '🧘',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=640&q=80',
    description: 'Yoga mats, blocks, straps, and comfortable activewear',
    keywords: ['yoga', 'mat', 'meditation', 'stretch', 'pilates'],
    relatedProducts: ['equipment', 'performance-wear', 'accessories'],
  },
  {
    id: 'badminton',
    name: 'Badminton',
    slug: 'badminton',
    icon: '🏸',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=640&q=80',
    description: 'Badminton rackets, shuttlecocks, shoes, and nets',
    keywords: ['badminton', 'racket', 'shuttlecock', 'net', 'court'],
    relatedProducts: ['equipment', 'footwear', 'performance-wear', 'accessories'],
  },
  {
    id: 'golf',
    name: 'Golf',
    slug: 'golf',
    icon: '⛳',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=640&q=80',
    description: 'Golf clubs, balls, bags, and course apparel',
    keywords: ['golf', 'club', 'putt', 'driver', 'tee', 'fairway'],
    relatedProducts: ['equipment', 'gear', 'performance-wear', 'footwear'],
  },
  {
    id: 'boxing',
    name: 'Boxing & MMA',
    slug: 'boxing',
    icon: '🥊',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=640&q=80',
    description: 'Boxing gloves, punching bags, wraps, and fight gear',
    keywords: ['boxing', 'mma', 'glove', 'punch', 'fight', 'martial'],
    relatedProducts: ['equipment', 'accessories', 'performance-wear'],
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    slug: 'volleyball',
    icon: '🏐',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=640&q=80',
    description: 'Volleyball balls, nets, knee pads, and team apparel',
    keywords: ['volleyball', 'net', 'spike', 'serve', 'beach'],
    relatedProducts: ['equipment', 'performance-wear', 'accessories', 'footwear'],
  },
  {
    id: 'hiking',
    name: 'Hiking & Outdoor',
    slug: 'hiking',
    icon: '🥾',
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=640&q=80',
    description: 'Hiking boots, backpacks, trekking poles, and outdoor gear',
    keywords: ['hiking', 'trekking', 'outdoor', 'trail', 'mountain', 'camping'],
    relatedProducts: ['footwear', 'gear', 'accessories', 'performance-wear'],
  },
  {
    id: 'skating',
    name: 'Skating',
    slug: 'skating',
    icon: '⛸️',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=640&q=80',
    description: 'Skates, protective gear, and skating accessories',
    keywords: ['skating', 'skate', 'roller', 'ice', 'blade', 'wheel'],
    relatedProducts: ['footwear', 'accessories', 'gear'],
  },
]

// Product type categories
export const productTypes = [
  {
    id: 'all',
    name: 'All Products',
    slug: 'all',
    icon: '📦',
    description: 'Browse all products',
    keywords: [],
  },
  {
    id: 'performance-wear',
    name: 'Performance Wear',
    slug: 'performance-wear',
    icon: '👕',
    description: 'Athletic clothing designed for peak performance',
    keywords: ['shirt', 'jersey', 'shorts', 'pants', 'jacket', 'wear', 'clothing'],
  },
  {
    id: 'footwear',
    name: 'Footwear',
    slug: 'footwear',
    icon: '👟',
    description: 'Sports shoes, boots, and athletic footwear',
    keywords: ['shoe', 'sneaker', 'boot', 'cleat', 'sandal', 'slipper'],
  },
  {
    id: 'equipment',
    name: 'Equipment',
    slug: 'equipment',
    icon: '🎯',
    description: 'Sports equipment and training gear',
    keywords: ['bat', 'ball', 'racket', 'mat', 'weights', 'equipment', 'gear'],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    icon: '🎒',
    description: 'Sports accessories and small items',
    keywords: ['watch', 'band', 'glove', 'cap', 'hat', 'sock', 'accessory'],
  },
  {
    id: 'gear',
    name: 'Bags & Gear',
    slug: 'gear',
    icon: '🎽',
    description: 'Sports bags, backpacks, and carrying gear',
    keywords: ['bag', 'backpack', 'duffel', 'gym bag', 'carrier'],
  },
  {
    id: 'wearable',
    name: 'Wearable Tech',
    slug: 'wearable',
    icon: '⌚',
    description: 'Smart watches, fitness trackers, and wearable technology',
    keywords: ['watch', 'tracker', 'smart', 'fitness', 'monitor', 'wearable'],
  },
]

// Helper functions
export const getSportBySlug = (slug) => {
  return sportsCategories.find((sport) => sport.slug === slug)
}

export const getSportById = (id) => {
  return sportsCategories.find((sport) => sport.id === id)
}

export const getProductTypeBySlug = (slug) => {
  return productTypes.find((type) => type.slug === slug)
}

export const getSportsForNavbar = () => {
  return sportsCategories.map(({ name, slug, icon }) => ({ name, slug, icon }))
}

export const getProductTypesForNavbar = () => {
  return productTypes.map(({ name, slug, icon }) => ({ name, slug, icon }))
}

// Check if a product matches a sport based on keywords
export const productMatchesSport = (product, sportSlug) => {
  if (sportSlug === 'all') return true
  
  const sport = getSportBySlug(sportSlug)
  if (!sport) return false
  
  const productName = (product.name || '').toLowerCase()
  const productDesc = (product.description || '').toLowerCase()
  const productCategory = (product.category || '').toLowerCase()
  const productSport = (product.sport || '').toLowerCase()
  
  // Direct sport match
  if (productSport === sportSlug || productSport === sport.name.toLowerCase()) {
    return true
  }
  
  // Keyword match
  return sport.keywords.some((keyword) => 
    productName.includes(keyword) || 
    productDesc.includes(keyword) || 
    productCategory.includes(keyword)
  )
}

// Check if a product matches a product type based on keywords
export const productMatchesType = (product, typeSlug) => {
  if (typeSlug === 'all') return true
  
  const type = getProductTypeBySlug(typeSlug)
  if (!type) return false
  
  const productName = (product.name || '').toLowerCase()
  const productCategory = (product.category || '').toLowerCase()
  
  // Category match
  if (productCategory.includes(typeSlug.replace('-', ' '))) {
    return true
  }
  
  // Keyword match
  return type.keywords.some((keyword) => 
    productName.includes(keyword) || 
    productCategory.includes(keyword)
  )
}

export default {
  sportsCategories,
  productTypes,
  getSportBySlug,
  getSportById,
  getProductTypeBySlug,
  getSportsForNavbar,
  getProductTypesForNavbar,
  productMatchesSport,
  productMatchesType,
}
