import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CheckoutStep } from '../../models/checkout.models'

@Component({
  selector: 'app-checkout-steps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-steps.component.html',
  styleUrl: './checkout-steps.component.scss'
})
export class CheckoutStepsComponent {
  @Input() steps: CheckoutStep[] = []
}
