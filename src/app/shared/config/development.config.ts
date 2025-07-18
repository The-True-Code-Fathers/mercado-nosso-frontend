// Configurações para desenvolvimento
export const DEVELOPMENT_CONFIG = {
  // User ID fixo para desenvolvimento (substitua por um AuthService real)
  DEFAULT_USER_ID: '4f340ab7-b0ac-4a58-8672-9dca8f69e7bd',

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

// Permite atualizar o DEFAULT_USER_ID em tempo de execução
export function setDevelopmentUserId(id: string) {
  DEVELOPMENT_CONFIG.DEFAULT_USER_ID = id
}
