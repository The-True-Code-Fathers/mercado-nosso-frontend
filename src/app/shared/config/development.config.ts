// Configurações para desenvolvimento
const LOCAL_STORAGE_KEY = 'devUserId'

function getDevelopmentUserId(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored || '0'
  }
  return '0'
}

export const DEVELOPMENT_CONFIG = {
  // User ID fixo para desenvolvimento (substitua por um AuthService real)
  get DEFAULT_USER_ID() {
    return getDevelopmentUserId()
  },

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
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, id)
  }
}

// Limpa o userId de desenvolvimento e outros ids relacionados (para logout)
export function clearDevelopmentUserId() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    localStorage.removeItem('currentUserId')
    localStorage.removeItem('userId')
  }
}
