import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { MessageService } from 'primeng/api'
import { ToastModule } from 'primeng/toast'
import { CheckoutService } from './services/checkout.service'
import { CartService } from '../cart/services/cart.service'
import { CartItem } from '../cart/cart.component'
import { CheckoutStepsComponent } from './components/checkout-steps/checkout-steps.component'
import { OrderSummaryComponent } from './components/order-summary/order-summary.component'
import { ShippingStepComponent } from './components/shipping-step/shipping-step.component'
import { PaymentStepComponent } from './components/payment-step/payment-step.component'
import { ConfirmationStepComponent } from './components/confirmation-step/confirmation-step.component'

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    CheckoutStepsComponent,
    OrderSummaryComponent,
    ShippingStepComponent,
    PaymentStepComponent,
    ConfirmationStepComponent
  ],
  providers: [MessageService],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  private checkoutService = inject(CheckoutService)
  private cartService = inject(CartService)
  private messageService = inject(MessageService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  // Signal getters for reactive UI
  currentStep = this.checkoutService.currentStep
  steps = this.checkoutService.steps
  orderSummary = this.checkoutService.orderSummary
  isLoading = this.checkoutService.isLoading

  ngOnInit(): void {
    this.initializeCheckout()
  }

  private initializeCheckout(): void {
    // Load cart and initialize checkout
    this.cartService.getCart().subscribe({
      next: (cartResponse) => {
        // Convert cart response to checkout items
        const cartItems = cartResponse.items.map(item => ({
          listingId: item.listingId,
          name: `Produto ${item.listingId}`, // Mock name - in real app get from listing service
          unitPrice: item.price / item.quantity,
          price: item.price,
          quantity: item.quantity,
          image: 'https://via.placeholder.com/80x80?text=📦',
          category: 'Produto',
          selected: true,
          shippingPrice: item.shippingPrice || 0
        }))

        if (cartItems.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Carrinho Vazio',
            detail: 'Adicione produtos ao carrinho antes de finalizar a compra',
            life: 5000
          })
          this.router.navigate(['/cart'])
          return
        }

        // Initialize checkout with cart items
        this.checkoutService.initializeCheckout(cartItems)
      },
      error: (error) => {
        console.error('Error loading cart:', error)
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar o carrinho',
          life: 5000
        })
        this.router.navigate(['/cart'])
      }
    })
  }

  goToCart(): void {
    this.router.navigate(['/cart'])
  }

  continueToShipping(): void {
    this.checkoutService.nextStep()
  }
}

