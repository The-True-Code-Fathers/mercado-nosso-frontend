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
  template: `
    <div class="success-container">
      <div class="success-card">
        <div class="success-header">
          <div class="success-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <h1>Pedido Confirmado!</h1>
          <p>Obrigado por comprar conosco. Seu pedido foi processado com sucesso.</p>
        </div>

        <p-divider></p-divider>

        <div class="order-details" *ngIf="order">
          <div class="order-info">
            <div class="info-row">
              <span class="label">Número do Pedido:</span>
              <span class="value">{{ order.orderNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">Data do Pedido:</span>
              <span class="value">{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Valor Total:</span>
              <span class="value total">R$ {{ order.total | number : '1.2-2' }}</span>
            </div>
            <div class="info-row" *ngIf="order.estimatedDelivery">
              <span class="label">Previsão de Entrega:</span>
              <span class="value">{{ order.estimatedDelivery }}</span>
            </div>
            <div class="info-row" *ngIf="order.trackingCode">
              <span class="label">Código de Rastreamento:</span>
              <span class="value tracking">{{ order.trackingCode }}</span>
            </div>
          </div>

          <p-divider></p-divider>

          <div class="delivery-section">
            <div class="delivery-icon">
              <i class="pi pi-truck"></i>
            </div>
            <div class="delivery-info">
              <h3>Informações de Entrega</h3>
              <p class="delivery-address">
                {{ order.shippingAddress.fullName }}<br>
                {{ order.shippingAddress.street }}, {{ order.shippingAddress.number }}<br>
                <span *ngIf="order.shippingAddress.complement">{{ order.shippingAddress.complement }}<br></span>
                {{ order.shippingAddress.neighborhood }} - {{ order.shippingAddress.city }}/{{ order.shippingAddress.state }}<br>
                CEP: {{ order.shippingAddress.zipCode }}
              </p>
              <p class="delivery-estimate">
                <strong>Chegará entre {{ order.estimatedDelivery }}</strong>
              </p>
            </div>
          </div>

          <p-divider></p-divider>

          <div class="items-summary">
            <h3>Produtos Comprados ({{ order.items.length }})</h3>
            <div class="items-list">
              <div *ngFor="let item of order.items" class="order-item">
                <div class="item-image">
                  <img [src]="item.image" [alt]="item.name" />
                </div>
                <div class="item-details">
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.quantity }}x R$ {{ item.unitPrice | number : '1.2-2' }}</p>
                  <p class="seller">Vendido por: {{ item.sellerName || 'Loja Demo' }}</p>
                </div>
                <div class="item-total">
                  R$ {{ item.totalPrice | number : '1.2-2' }}
                </div>
              </div>
            </div>
          </div>

          <p-divider></p-divider>

          <div class="next-steps">
            <h3>Próximos Passos</h3>
            <div class="steps-list">
              <div class="step-item">
                <i class="pi pi-envelope step-icon"></i>
                <div class="step-content">
                  <h4>Confirmação por Email</h4>
                  <p>Enviamos um email com os detalhes do seu pedido</p>
                </div>
              </div>
              <div class="step-item">
                <i class="pi pi-cog step-icon"></i>
                <div class="step-content">
                  <h4>Preparação</h4>
                  <p>O vendedor foi notificado e começará a preparar seu pedido</p>
                </div>
              </div>
              <div class="step-item">
                <i class="pi pi-send step-icon"></i>
                <div class="step-content">
                  <h4>Envio</h4>
                  <p>Você receberá o código de rastreamento quando o produto for enviado</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="success-actions">
          <p-button
            label="Rastrear Pedido"
            icon="pi pi-search"
            styleClass="p-button-outlined"
            (click)="trackOrder()"
            *ngIf="order?.trackingCode"
          >
          </p-button>
          
          <p-button
            label="Continuar Comprando"
            icon="pi pi-shopping-cart"
            (click)="continueShopping()"
          >
          </p-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 80vh;
      padding: var(--spacing-xl) var(--spacing-md);
      background: var(--color-bg);
    }

    .success-card {
      background: var(--color-surface);
      border-radius: 12px;
      padding: var(--spacing-xl);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      max-width: 800px;
      width: 100%;
    }

    .success-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: var(--color-success);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-lg) auto;
      color: white;
      font-size: 2.5rem;
    }

    .success-header h1 {
      color: var(--color-text-primary);
      font-size: 2.2rem;
      font-weight: 600;
      margin: 0 0 var(--spacing-sm) 0;
    }

    .success-header p {
      color: var(--color-text-secondary);
      font-size: 1.1rem;
      margin: 0;
      line-height: 1.5;
    }

    .order-details {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .order-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) 0;
    }

    .info-row .label {
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .info-row .value {
      color: var(--color-text-primary);
      font-weight: 600;
      text-align: right;
    }

    .info-row .value.total {
      color: var(--color-success);
      font-size: 1.2rem;
    }

    .info-row .value.tracking {
      color: var(--color-primary);
      font-family: monospace;
      font-size: 0.9rem;
    }

    .delivery-section {
      display: flex;
      gap: var(--spacing-lg);
      align-items: flex-start;
    }

    .delivery-icon {
      width: 60px;
      height: 60px;
      background: var(--color-primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .delivery-info h3 {
      color: var(--color-text-primary);
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 var(--spacing-sm) 0;
    }

    .delivery-address {
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin: 0 0 var(--spacing-md) 0;
    }

    .delivery-estimate {
      color: var(--color-primary);
      font-size: 1rem;
      margin: 0;
    }

    .items-summary h3 {
      color: var(--color-text-primary);
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 var(--spacing-lg) 0;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .order-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--color-elevation-1);
      border-radius: 8px;
      align-items: center;
    }

    .item-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details {
      flex: 1;
    }

    .item-details h4 {
      color: var(--color-text-primary);
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 var(--spacing-xs) 0;
    }

    .item-details p {
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      margin: 0 0 var(--spacing-xs) 0;
    }

    .item-details .seller {
      font-style: italic;
      font-size: 0.85rem;
    }

    .item-total {
      color: var(--color-text-primary);
      font-weight: 600;
      font-size: 1rem;
    }

    .next-steps h3 {
      color: var(--color-text-primary);
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 var(--spacing-lg) 0;
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .step-item {
      display: flex;
      gap: var(--spacing-md);
      align-items: flex-start;
    }

    .step-icon {
      width: 40px;
      height: 40px;
      background: var(--color-elevation-2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary);
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .step-content h4 {
      color: var(--color-text-primary);
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 var(--spacing-xs) 0;
    }

    .step-content p {
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      margin: 0;
      line-height: 1.4;
    }

    .success-actions {
      display: flex;
      justify-content: center;
      gap: var(--spacing-md);
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--color-border);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .success-container {
        padding: var(--spacing-lg) var(--spacing-sm);
      }

      .success-card {
        padding: var(--spacing-lg);
      }

      .success-header h1 {
        font-size: 1.8rem;
      }

      .success-icon {
        width: 60px;
        height: 60px;
        font-size: 2rem;
      }

      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
      }

      .info-row .value {
        text-align: left;
      }

      .delivery-section {
        flex-direction: column;
        text-align: center;
      }

      .delivery-icon {
        align-self: center;
      }

      .order-item {
        flex-direction: column;
        text-align: center;
      }

      .item-image {
        width: 80px;
        height: 80px;
        align-self: center;
      }

      .success-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .success-actions p-button {
        width: 100%;
      }
    }

    /* PrimeNG overrides */
    :host ::ng-deep .p-divider {
      margin: var(--spacing-lg) 0;
    }

    :host ::ng-deep .p-button {
      min-width: 140px;
    }
  `]
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
