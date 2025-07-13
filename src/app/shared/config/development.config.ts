// Configurações para desenvolvimento
export const DEVELOPMENT_CONFIG = {
  // User ID fixo para desenvolvimento (substitua por um AuthService real)
  DEFAULT_USER_ID: '3b02ccf3-3154-4eab-9367-9673a718539f',

  // URLs da API
  API_BASE_URL: 'http://localhost:8080',
  API_ENDPOINTS: {
    CARTS: '/api/carts/carts',
    LISTINGS: '/api/listings',
    PRODUCTS: '/api/products',
  },

  // Configurações de carrinho
  CART_CONFIG: {
    DEFAULT_SHIPPING_PERCENTAGE: 0.05, // 5%
    DEFAULT_ITEMS_SELECTED: true,
  },
}
