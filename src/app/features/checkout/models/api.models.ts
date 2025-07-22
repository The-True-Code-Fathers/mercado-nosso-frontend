// API DTOs matching the backend structure

export interface CreateOrderRequest {
  buyerId: string
  sellerId: string
  orderItems: OrderItemDTO[]
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  orderSummary: OrderSummary
}

export interface OrderItemDTO {
  listingId: string
  quantity: number
}

export interface ShippingAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  fullName: string
  id?: string
  isDefault?: boolean
}

export enum PaymentType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
}

export interface PaymentMethod {
  id?: string
  type: PaymentType
  cardNumber?: string
  cardholderName?: string
  expiryDate?: string
  cvv?: string
  installments?: number
  pixKey?: string
}

export interface OrderSummary {
  subtotal: number
  shippingTotal: number
  discountTotal: number
  total: number
  itemsCount: number
}

export interface CreateOrderResponse {
  orderId: string
  status: string
  // Add more fields based on the actual API response
}
