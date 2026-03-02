import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const OrderContext = createContext()

// Load orders from localStorage
const loadOrders = () => {
  try {
    const saved = localStorage.getItem('moder_orders')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders)

  // Refresh orders from localStorage
  const refreshOrders = useCallback(() => {
    setOrders(loadOrders())
  }, [])

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('moder_orders', JSON.stringify(orders))
  }, [orders])

  const addOrder = (orderData) => {
    const newOrder = {
      id: orderData.id || '#SO-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
      ...orderData,
      status: orderData.status || 'Pending',
      date: orderData.date || new Date().toISOString().split('T')[0],
    }
    setOrders(prev => [newOrder, ...prev])
    return newOrder
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
  }

  const getOrderById = (orderId) => {
    return orders.find(o => o.id === orderId)
  }

  const getOrdersByEmail = (email) => {
    return orders.filter(o => o.email.toLowerCase() === email.toLowerCase())
  }

  const getOrderStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayOrders = orders.filter(o => o.date === today)
    
    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      todayRevenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
      pending: orders.filter(o => o.status === 'Pending').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length,
    }
  }

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      updateOrderStatus,
      getOrderById,
      getOrdersByEmail,
      getOrderStats,
      refreshOrders,
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider')
  }
  return context
}
