import { Injectable, signal } from '@angular/core'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import {
  CheckoutItem,
  ShippingAddress,
  PaymentMethod,
  Order,
  OrderSummary,
  CheckoutStep,
  CHECKOUT_STEPS,
} from '../models/checkout.models'
import { OrderService } from './order.service'
import {
  CreateOrderRequest,
  OrderItemDTO,
  PaymentType as ApiPaymentType,
} from '../models/api.models'
import { DEVELOPMENT_CONFIG } from '../../../shared/config/development.config'

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  // State management with signals
  private _currentStep = signal<number>(0)
  private _checkoutItems = signal<CheckoutItem[]>([])
  private _shippingAddress = signal<ShippingAddress | null>(null)
  private _paymentMethod = signal<PaymentMethod | null>(null)
  private _orderSummary = signal<OrderSummary | null>(null)
  private _isLoading = signal<boolean>(false)

  // Public readonly signals
  currentStep = this._currentStep.asReadonly()
  checkoutItems = this._checkoutItems.asReadonly()
  shippingAddress = this._shippingAddress.asReadonly()
  paymentMethod = this._paymentMethod.asReadonly()
  orderSummary = this._orderSummary.asReadonly()
  isLoading = this._isLoading.asReadonly()

  // Steps management
  private _steps = signal<CheckoutStep[]>([...CHECKOUT_STEPS])
  steps = this._steps.asReadonly()

  constructor(private http: HttpClient, private orderService: OrderService) {}

  initializeCheckout(checkoutItems: CheckoutItem[]): void {
    this._checkoutItems.set(checkoutItems)
    this.updateOrderSummary()
    this.setCurrentStep(0)
  }

  // Step navigation
  setCurrentStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < CHECKOUT_STEPS.length) {
      this._currentStep.set(stepIndex)
      this.updateStepsState(stepIndex)
    }
  }

  nextStep(): boolean {
    const current = this._currentStep()
    if (current < CHECKOUT_STEPS.length - 1) {
      this.setCurrentStep(current + 1)
      return true
    }
    return false
  }

  previousStep(): boolean {
    const current = this._currentStep()
    if (current > 0) {
      this.setCurrentStep(current - 1)
      return true
    }
    return false
  }

  private updateStepsState(currentIndex: number): void {
    const updatedSteps = this._steps().map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      active: index === currentIndex,
    }))
    this._steps.set(updatedSteps)
  }

  // Address management
  setShippingAddress(address: ShippingAddress): void {
    this._shippingAddress.set(address)
    this.updateOrderSummary()
  }

  // Payment management
  setPaymentMethod(payment: PaymentMethod): void {
    this._paymentMethod.set(payment)
  }

  // Order summary calculation
  private updateOrderSummary(): void {
    const items = this._checkoutItems()
    if (items.length === 0) {
      this._orderSummary.set(null)
      return
    }

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const shippingTotal = items.reduce(
      (sum, item) => sum + item.shippingPrice,
      0,
    )
    const discountTotal = 0 // Can be calculated based on promotions
    const total = subtotal + shippingTotal - discountTotal
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

    this._orderSummary.set({
      items,
      subtotal,
      shippingTotal,
      discountTotal,
      total,
      itemsCount,
    })
  }

  // Mock data for development
  getShippingAddresses(): Observable<ShippingAddress[]> {
    const mockAddresses: ShippingAddress[] = [
      {
        id: '1',
        fullName: 'João Silva',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        isDefault: true,
      },
    ]
    return of(mockAddresses)
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    const mockPayments: PaymentMethod[] = [
      {
        id: '1',
        type: 'CREDIT_CARD',
        cardNumber: '**** **** **** 1234',
        cardholderName: 'JOAO SILVA',
        expiryDate: '12/26',
        installments: 1,
        isDefault: true,
      },
      {
        id: '2',
        type: 'PIX',
        isDefault: false,
      },
      {
        id: '3',
        type: 'APPLE_PAY',
        isDefault: false,
      },
    ]
    return of(mockPayments)
  }

  // Order placement with API integration
  placeOrder(): Observable<any> {
    const items = this._checkoutItems()
    const shippingAddress = this._shippingAddress()
    const paymentMethod = this._paymentMethod()
    const orderSummary = this._orderSummary()

    if (!items.length || !shippingAddress || !paymentMethod || !orderSummary) {
      throw new Error('Missing required checkout data')
    }

    this._isLoading.set(true)

    // Group items by seller
    const itemsBySeller = new Map<string, CheckoutItem[]>()
    items.forEach(item => {
      const sellerId = item.sellerId
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, [])
      }
      itemsBySeller.get(sellerId)!.push(item)
    })

    // Handle single seller case (most common)
    if (itemsBySeller.size > 1) {
      console.warn(
        'Multiple sellers detected. Creating order for first seller only.',
      )
    }

    const firstSellerId = Array.from(itemsBySeller.keys())[0]
    const sellerItems = itemsBySeller.get(firstSellerId)!

    // Map to API format
    const orderItems: OrderItemDTO[] = sellerItems.map(item => ({
      listingId: item.listingId,
      quantity: item.quantity,
    }))

    const orderRequest: CreateOrderRequest = {
      buyerId: DEVELOPMENT_CONFIG.DEFAULT_USER_ID,
      sellerId: firstSellerId,
      orderItems,
      shippingAddress: {
        street: shippingAddress.street,
        number: shippingAddress.number,
        complement: shippingAddress.complement,
        neighborhood: shippingAddress.neighborhood,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        fullName: shippingAddress.fullName,
        id: shippingAddress.id,
      },
      paymentMethod: {
        id: paymentMethod.id,
        type: this.mapPaymentType(paymentMethod.type),
        cardNumber: paymentMethod.cardNumber,
        cardholderName: paymentMethod.cardholderName,
        expiryDate: paymentMethod.expiryDate,
        cvv: paymentMethod.cvv,
        installments: paymentMethod.installments,
      },
      orderSummary: {
        subtotal: orderSummary.subtotal,
        shippingTotal: orderSummary.shippingTotal,
        discountTotal: orderSummary.discountTotal,
        total: orderSummary.total,
        itemsCount: orderSummary.itemsCount,
      },
    }

    console.log('Placing order with payload:', orderRequest)

    return this.orderService.createOrder(orderRequest).pipe(
      tap(response => {
        console.log('Order placed successfully:', response)
        this._isLoading.set(false)
      }),
      catchError(error => {
        console.error('Error placing order:', error)
        this._isLoading.set(false)
        throw error
      }),
    )
  }

  // Reset checkout state
  resetCheckout(): void {
    this._currentStep.set(0)
    this._checkoutItems.set([])
    this._shippingAddress.set(null)
    this._paymentMethod.set(null)
    this._orderSummary.set(null)
    this._isLoading.set(false)
    this._steps.set([...CHECKOUT_STEPS])
  }

  // Validation helpers
  canProceedToPayment(): boolean {
    return this._checkoutItems().length > 0 && this._shippingAddress() !== null
  }

  canProceedToConfirmation(): boolean {
    return this.canProceedToPayment() && this._paymentMethod() !== null
  }

  canPlaceOrder(): boolean {
    return this.canProceedToConfirmation()
  }

  private mapPaymentType(type: string): ApiPaymentType {
    switch (type) {
      case 'CREDIT_CARD':
        return ApiPaymentType.CREDIT_CARD
      case 'DEBIT_CARD':
        return ApiPaymentType.DEBIT_CARD
      case 'PIX':
        return ApiPaymentType.PIX
      default:
        throw new Error(`Unsupported payment type: ${type}`)
    }
  }
}
