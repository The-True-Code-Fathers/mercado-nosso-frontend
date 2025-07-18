import { Injectable, signal } from '@angular/core'
import { BehaviorSubject, Observable, of } from 'rxjs'
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

  constructor(private http: HttpClient) {}
 
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
      }
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

  // Order placement
  placeOrder(): Observable<Order> {
    this._isLoading.set(true)

    // Simulate API call
    const order: Order = {
      id: 'order-' + Date.now(),
      orderNumber: '#' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: 'user-123',
      items: this._checkoutItems(),
      shippingAddress: this._shippingAddress()!,
      paymentMethod: this._paymentMethod()!,
      status: 'CONFIRMED',
      subtotal: this._orderSummary()!.subtotal,
      shippingTotal: this._orderSummary()!.shippingTotal,
      discountTotal: this._orderSummary()!.discountTotal,
      total: this._orderSummary()!.total,
      createdAt: new Date().toISOString(),
      estimatedDelivery: this.calculateEstimatedDelivery(),
      trackingCode:
        'BR' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    }

    // Simulate network delay
    return new Observable(observer => {
      setTimeout(() => {
        this._isLoading.set(false)
        observer.next(order)
        observer.complete()
      }, 2000)
    })
  }

  private calculateEstimatedDelivery(): string {
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 7) // 7 days from now
    const endDate = new Date(deliveryDate)
    endDate.setDate(endDate.getDate() + 3) // 3-day window

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
    }

    return `${formatDate(deliveryDate)} - ${formatDate(endDate)}`
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
}
