import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ProductProvider } from './context/ProductContext'
import { OrderProvider } from './context/OrderContext'
import { UserProvider } from './context/UserContext'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <OrderProvider>
          <ProductProvider>
            <App />
          </ProductProvider>
        </OrderProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
