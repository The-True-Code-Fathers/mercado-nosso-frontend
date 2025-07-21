import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DividerModule } from 'primeng/divider'
import { OrderSummary } from '../../models/checkout.models'

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, DividerModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss'
})
export class OrderSummaryComponent {
  @Input() orderSummary: OrderSummary | null = null
}
