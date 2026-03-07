const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api'

// Helper to handle API responses
async function handleResponse(response) {
  const data = await response.json()
  if (!response.ok) {
    console.error('API Error:', data)
    throw new Error(data.message || 'Something went wrong')
  }
  return data
}

// Get user token from localStorage
function getToken() {
  const user = localStorage.getItem('moder_current_user')
  if (user) {
    const parsed = JSON.parse(user)
    return parsed.token
  }
  return null
}

// Get admin token from localStorage
function getAdminToken() {
  const admin = localStorage.getItem('moder_admin_user')
  if (admin) {
    const parsed = JSON.parse(admin)
    return parsed.token
  }
  return null
}

// Auth API calls
export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse(response)
}

export async function registerUser({ name, email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  return handleResponse(response)
}

// Products API calls
export async function getProducts(filters = {}) {
  const params = new URLSearchParams(filters).toString()
  const url = params ? `${API_BASE_URL}/products?${params}` : `${API_BASE_URL}/products`
  const response = await fetch(url)
  return handleResponse(response)
}

export async function getProduct(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`)
  return handleResponse(response)
}

// Cart / Orders API calls
export async function processPayment(orderData) {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  })
  return handleResponse(response)
}

export async function getOrders() {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  return handleResponse(response)
}

// Admin API calls
export async function adminLogin({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse(response)
}

export async function getAdminDashboard() {
  const token = getAdminToken()
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  return handleResponse(response)
}

export async function getAllOrders() {
  const token = getAdminToken()
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  return handleResponse(response)
}

export async function updateOrderStatus(orderId, status) {
  const token = getAdminToken()
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })
  return handleResponse(response)
}

export async function getAllUsers() {
  const token = getAdminToken()
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  return handleResponse(response)
}

export async function updateUserStatus(userId, status) {
  const token = getAdminToken()
  const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })
  return handleResponse(response)
}

// Product management (admin)
export async function createProduct(productData) {
  const token = getAdminToken()
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  })
  return handleResponse(response)
}

export async function updateProduct(productId, productData) {
  const token = getAdminToken()
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  })
  return handleResponse(response)
}

export async function deleteProduct(productId) {
  const token = getAdminToken()
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  })
  return handleResponse(response)
}

// Payment API
export async function getPaymentMethods() {
  const response = await fetch(`${API_BASE_URL}/payment/methods`)
  return handleResponse(response)
}

export async function processPaymentMethod(orderId, paymentMethod, paymentDetails = {}) {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}/payment/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId, paymentMethod, paymentDetails }),
  })
  return handleResponse(response)
}

// Default API object with axios-like methods
const api = {
  async get(url) {
    const token = getAdminToken() || getToken()
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    })
    return { data: await handleResponse(response) }
  },

  async post(url, data) {
    const token = getAdminToken() || getToken()
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    })
    return { data: await handleResponse(response) }
  },

  async put(url, data) {
    const token = getAdminToken() || getToken()
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    })
    return { data: await handleResponse(response) }
  },

  async patch(url, data) {
    const token = getAdminToken() || getToken()
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    })
    return { data: await handleResponse(response) }
  },

  async delete(url) {
    const token = getAdminToken() || getToken()
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    })
    return { data: await handleResponse(response) }
  },
}

export default api
