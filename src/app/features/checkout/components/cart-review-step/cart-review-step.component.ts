import { Component, inject, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { CheckoutService } from '../../services/checkout.service'
import { OrderSummary } from '../../models/checkout.models'
import { CheckoutNavigationComponent } from '../shared'

@Component({
  selector: 'app-cart-review-step',
  standalone: true,
  imports: [CommonModule, CheckoutNavigationComponent],
  templateUrl: './cart-review-step.component.html',
  styleUrl: './cart-review-step.component.scss'
})
export class CartReviewStepComponent {
  private router = inject(Router)
  private checkoutService = inject(CheckoutService)

  @Input() orderSummary: OrderSummary | null = null

  goToCart(): void {
    this.router.navigate(['/cart'])
  }

  continueToShipping(): void {
    this.checkoutService.nextStep()
  }

  canContinue(): boolean {
    return this.orderSummary !== null && this.orderSummary.items.length > 0
  }
}
