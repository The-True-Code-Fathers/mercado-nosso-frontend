// Configurações para desenvolvimento
const LOCAL_STORAGE_KEY = 'devUserId'
let defaultUserId = '0'
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (stored) defaultUserId = stored
}

export const DEVELOPMENT_CONFIG = {
  // User ID fixo para desenvolvimento (substitua por um AuthService real)
  DEFAULT_USER_ID: defaultUserId,

  // URLs da API
  API_BASE_URL: 'http://localhost:8080',
  API_ENDPOINTS: {
    CARTS: '/api/carts',
    LISTINGS: '/api/listings',
    PRODUCTS: '/api/products',
  },

  // Configurações de carrinho
  CART_CONFIG: {
    DEFAULT_SHIPPING_PERCENTAGE: 0.05, // 5%
    DEFAULT_ITEMS_SELECTED: true,
  },
}

// Permite atualizar o DEFAULT_USER_ID em tempo de execução e persiste no localStorage
export function setDevelopmentUserId(id: string) {
  DEVELOPMENT_CONFIG.DEFAULT_USER_ID = id
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, id)
  }
}
