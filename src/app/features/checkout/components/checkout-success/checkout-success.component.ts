import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { DividerModule } from 'primeng/divider'
import { Router } from '@angular/router'
import { Order } from '../../models/checkout.models'

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, DividerModule],
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.scss']
})
export class CheckoutSuccessComponent implements OnInit {
  order: Order | null = null

  constructor(private router: Router) {
    // Get order data from navigation state
    const navigation = this.router.getCurrentNavigation()
    if (navigation?.extras?.state?.['order']) {
      this.order = navigation.extras.state['order']
    }
  }

  ngOnInit(): void {
    // If no order data, redirect to home
    if (!this.order) {
      this.router.navigate(['/home'])
    }
  }

  trackOrder(): void {
    if (this.order?.trackingCode) {
      // In a real app, this would open tracking page or external tracking site
      alert(`Tracking code: ${this.order.trackingCode}\n\nEm breve implementaremos o rastreamento completo.`)
    }
  }

  continueShopping(): void {
    this.router.navigate(['/home'])
  }
}
