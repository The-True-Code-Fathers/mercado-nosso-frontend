import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, DividerModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})

export class CheckoutComponent {
  orderData = {
    orderNumber: '#5781237817',
    date: '04/07/2025',
    product: {
      name: 'Apple iPhone 16e - 128GB',
      price: 'R$ 499,99',
      quantity: 12,
      image: 'assets/images/products/iphone.jpg'
    },
    delivery: {
      estimatedDate: '22 - 24 de julho',
      type: '12 dias úteis - XiqueXique - BA'
    }
  }

  constructor(private router: Router) {}

  continueShopping() {
    this.router.navigate(['/home'])
  }
}

