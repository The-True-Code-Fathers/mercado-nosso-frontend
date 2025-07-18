import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { DividerModule } from 'primeng/divider'
import { MessageService } from 'primeng/api'
import { ToastModule } from 'primeng/toast'
import { CheckoutService } from '../../services/checkout.service'
import { CartService } from '../../../cart/services/cart.service'
import { CheckoutNavigationComponent } from '../shared/checkout-navigation/checkout-navigation.component'

@Component({
  selector: 'app-confirmation-step',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    DividerModule,
    ToastModule,
    CheckoutNavigationComponent
  ],
  providers: [MessageService],
  templateUrl: './confirmation-step.component.html',
  styleUrl: './confirmation-step.component.scss'
})
export class ConfirmationStepComponent implements OnInit {
  private checkoutService = inject(CheckoutService)
  private cartService = inject(CartService)
  private messageService = inject(MessageService)
  private router = inject(Router)

  // Signal getters for reactive UI
  checkoutItems = this.checkoutService.checkoutItems
  shippingAddress = this.checkoutService.shippingAddress
  paymentMethod = this.checkoutService.paymentMethod
  orderSummary = this.checkoutService.orderSummary
  isLoading = this.checkoutService.isLoading

  // Additional properties for template
  isPlacingOrder = false

  ngOnInit(): void {
    // Verify all required data is present
    if (!this.shippingAddress() || !this.paymentMethod()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Informações de entrega ou pagamento incompletas'
      })
      this.checkoutService.setCurrentStep(0)
    }
  }

  async placeOrder(): Promise<void> {
    this.isPlacingOrder = true
    try {
      const order = await this.checkoutService.placeOrder().toPromise()
      
      if (order) {
        // Clear cart after successful order
        await this.cartService.clearCart().toPromise()
        
        this.messageService.add({
          severity: 'success',
          summary: 'Pedido Finalizado!',
          detail: `Seu pedido #${order.orderNumber} foi criado com sucesso`,
          life: 5000
        })

        // Navigate to success page or order details
        this.router.navigate(['/checkout/success'], { 
          queryParams: { orderId: order.id } 
        })
      }
    } catch (error) {
      console.error('Error completing order:', error)
      this.messageService.add({
        severity: 'error',
        summary: 'Erro ao Finalizar Pedido',
        detail: 'Ocorreu um erro ao processar seu pedido. Tente novamente.',
        life: 5000
      })
    } finally {
      this.isPlacingOrder = false
    }
  }

  canPlaceOrder(): boolean {
    return this.checkoutService.canPlaceOrder()
  }

  getPaymentIcon(type: string): string {
    switch (type) {
      case 'CREDIT_CARD':
        return 'pi pi-credit-card'
      case 'DEBIT_CARD':
        return 'pi pi-credit-card'
      case 'PIX':
        return 'pi pi-mobile'
      case 'APPLE_PAY':
        return 'pi pi-apple'
      case 'PAYPAL':
        return 'pi pi-paypal'
      case 'MERCADO_PAGO':
        return 'pi pi-wallet'
      default:
        return 'pi pi-credit-card'
    }
  }

  getPaymentTitle(type: string): string {
    switch (type) {
      case 'CREDIT_CARD':
        return 'Cartão de Crédito'
      case 'DEBIT_CARD':
        return 'Cartão de Débito'
      case 'PIX':
        return 'PIX'
      case 'APPLE_PAY':
        return 'Apple Pay'
      case 'PAYPAL':
        return 'PayPal'
      case 'MERCADO_PAGO':
        return 'Mercado Pago'
      default:
        return 'Não informado'
    }
  }

  async completeOrder(): Promise<void> {
    try {
      const order = await this.checkoutService.placeOrder().toPromise()
      
      if (order) {
        // Clear cart after successful order
        await this.cartService.clearCart().toPromise()
        
        this.messageService.add({
          severity: 'success',
          summary: 'Pedido Finalizado!',
          detail: `Seu pedido #${order.id} foi criado com sucesso`,
          life: 5000
        })

        // Navigate to success page or order details
        this.router.navigate(['/checkout/success'], { 
          queryParams: { orderId: order.id } 
        })
      }
    } catch (error) {
      console.error('Error completing order:', error)
      this.messageService.add({
        severity: 'error',
        summary: 'Erro ao Finalizar Pedido',
        detail: 'Ocorreu um erro ao processar seu pedido. Tente novamente.',
        life: 5000
      })
    }
  }

  goBack(): void {
    this.checkoutService.previousStep()
  }

  editShipping(): void {
    this.checkoutService.setCurrentStep(1) // Go to shipping step
  }

  editPayment(): void {
    this.checkoutService.setCurrentStep(2) // Go to payment step
  }

  getPaymentMethodLabel(): string {
    const method = this.paymentMethod()
    if (!method) return ''

    switch (method.type) {
      case 'CREDIT_CARD':
        return `Cartão de Crédito ${method.cardNumber}`
      case 'DEBIT_CARD':
        return `Cartão de Débito ${method.cardNumber}`
      case 'PIX':
        return 'PIX'
      case 'APPLE_PAY':
        return 'Apple Pay'
      case 'PAYPAL':
        return 'PayPal'
      case 'MERCADO_PAGO':
        return 'Mercado Pago'
      default:
        return 'Não informado'
    }
  }

  getInstallmentLabel(): string {
    const method = this.paymentMethod()
    if (!method || !method.installments) return ''

    if (method.installments === 1) {
      return 'À vista'
    }
    
    return `${method.installments}x${method.installments <= 3 ? ' sem juros' : ' com juros'}`
  }
}
