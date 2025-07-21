export interface CheckoutItem {
  listingId: string
  name: string
  unitPrice: number
  quantity: number
  totalPrice: number
  image: string
  sellerId: string
  sellerName?: string
  shippingPrice: number
}

export interface ShippingAddress {
  id?: string
  fullName: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault?: boolean
}

export interface PaymentMethod {
  id: string
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'APPLE_PAY' | 'PAYPAL' | 'MERCADO_PAGO'
  cardNumber?: string
  cardholderName?: string
  expiryDate?: string
  cvv?: string
  installments?: number
  isDefault?: boolean
}

export interface OrderSummary {
  items: CheckoutItem[]
  subtotal: number
  shippingTotal: number
  discountTotal: number
  total: number
  itemsCount: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  items: CheckoutItem[]
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  subtotal: number
  shippingTotal: number
  discountTotal: number
  total: number
  createdAt: string
  estimatedDelivery?: string
  trackingCode?: string
}

export interface CheckoutStep {
  id: string
  title: string
  description: string
  completed: boolean
  active: boolean
}

export const CHECKOUT_STEPS: CheckoutStep[] = [
  {
    id: 'cart',
    title: 'Carrinho',
    description: 'Revisar produtos',
    completed: false,
    active: true,
  },
  {
    id: 'shipping',
    title: 'Endereço',
    description: 'Dados de entrega',
    completed: false,
    active: false,
  },
  {
    id: 'payment',
    title: 'Pagamento',
    description: 'Forma de pagamento',
    completed: false,
    active: false,
  },
  {
    id: 'confirmation',
    title: 'Confirmação',
    description: 'Revisar pedido',
    completed: false,
    active: false,
  },
]
