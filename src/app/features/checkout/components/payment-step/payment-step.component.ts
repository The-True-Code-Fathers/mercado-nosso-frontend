import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { RadioButtonModule } from 'primeng/radiobutton'
import { InputTextModule } from 'primeng/inputtext'
import { DropdownModule } from 'primeng/dropdown'
import { DividerModule } from 'primeng/divider'
import { CheckboxModule } from 'primeng/checkbox'
import { MessageService } from 'primeng/api'
import { ToastModule } from 'primeng/toast'
import { CheckoutService } from '../../services/checkout.service'
import { PaymentMethod } from '../../models/checkout.models'

@Component({
  selector: 'app-payment-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    RadioButtonModule,
    InputTextModule,
    DropdownModule,
    DividerModule,
    CheckboxModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './payment-step.component.html',
  styleUrl: './payment-step.component.scss'
})
export class PaymentStepComponent implements OnInit {
  private checkoutService = inject(CheckoutService)
  private messageService = inject(MessageService)

  selectedPaymentType: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'APPLE_PAY' | 'PAYPAL' | 'MERCADO_PAGO' = 'CREDIT_CARD'
  
  // Additional properties for template
  savedPaymentMethods: PaymentMethod[] = []
  selectedMethodId: string | null = null
  selectedQuickMethod: string | null = null
  showNewCardForm = false
  saveNewCard = false
  selectedInstallments = 1
  
  // New card form object
  newCard = {
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    installments: 1
  }
  
  creditCard = {
    number: '',
    holderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    installments: 1
  }

  months = [
    { name: '01', value: '01' },
    { name: '02', value: '02' },
    { name: '03', value: '03' },
    { name: '04', value: '04' },
    { name: '05', value: '05' },
    { name: '06', value: '06' },
    { name: '07', value: '07' },
    { name: '08', value: '08' },
    { name: '09', value: '09' },
    { name: '10', value: '10' },
    { name: '11', value: '11' },
    { name: '12', value: '12' }
  ]

  years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i
    return { name: year.toString(), value: year.toString() }
  })

  installmentOptions = [
    { label: '1x sem juros', value: 1 },
    { label: '2x sem juros', value: 2 },
    { label: '3x sem juros', value: 3 },
    { label: '4x com juros', value: 4 },
    { label: '5x com juros', value: 5 },
    { label: '6x com juros', value: 6 }
  ]

  ngOnInit(): void {
    // Load any saved payment methods if needed
    this.loadSavedPaymentMethods()
  }

  loadSavedPaymentMethods(): void {
    // Load from service or mock data
    this.checkoutService.getMockPaymentMethods().subscribe(methods => {
      this.savedPaymentMethods = methods
    })
  }

  onMethodSelect(method: PaymentMethod): void {
    this.selectedMethodId = method.id
    this.selectedPaymentType = method.type
  }

  selectQuickMethod(type: string): void {
    this.selectedQuickMethod = type
    this.selectedPaymentType = type as any
    this.selectedMethodId = null
  }

  toggleNewCardForm(): void {
    this.showNewCardForm = !this.showNewCardForm
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '')
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4)
    }
    event.target.value = value
    this.newCard.expiryDate = value
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

  canContinue(): boolean {
    if (this.selectedMethodId) {
      return true // Using saved method
    }
    
    if (this.selectedQuickMethod && this.selectedQuickMethod !== 'CREDIT_CARD' && this.selectedQuickMethod !== 'DEBIT_CARD') {
      return true // Using quick method like PIX, Apple Pay, etc.
    }

    if (this.showNewCardForm) {
      return this.newCard.cardNumber.length >= 16 && 
             this.newCard.cardholderName.length > 0 &&
             this.newCard.expiryDate.length >= 5 &&
             this.newCard.cvv.length >= 3
    }

    // Default card form validation
    return this.creditCard.number.length >= 16 && 
           this.creditCard.holderName.length > 0 &&
           this.creditCard.expiryMonth.length > 0 &&
           this.creditCard.expiryYear.length > 0 &&
           this.creditCard.cvv.length >= 3
  }

  validatePayment(): boolean {
    if (this.selectedPaymentType === 'CREDIT_CARD' || this.selectedPaymentType === 'DEBIT_CARD') {
      if (!this.creditCard.number || this.creditCard.number.length < 16) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Número do cartão é obrigatório'
        })
        return false
      }

      if (!this.creditCard.holderName) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Nome do titular é obrigatório'
        })
        return false
      }

      if (!this.creditCard.expiryMonth || !this.creditCard.expiryYear) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Data de validade é obrigatória'
        })
        return false
      }

      if (!this.creditCard.cvv || this.creditCard.cvv.length < 3) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'CVV é obrigatório'
        })
        return false
      }
    }

    return true
  }

  continueToConfirmation(): void {
    if (!this.validatePayment()) {
      return
    }

    const paymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: this.selectedPaymentType,
      ...(this.selectedPaymentType === 'CREDIT_CARD' || this.selectedPaymentType === 'DEBIT_CARD' ? {
        cardNumber: `****-****-****-${this.creditCard.number.slice(-4)}`,
        cardholderName: this.creditCard.holderName,
        expiryDate: `${this.creditCard.expiryMonth}/${this.creditCard.expiryYear}`,
        installments: this.creditCard.installments
      } : {})
    }

    this.checkoutService.setPaymentMethod(paymentMethod)
    this.checkoutService.nextStep()
  }

  goBack(): void {
    this.checkoutService.previousStep()
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '')
    value = value.replace(/(\d{4})(?=\d)/g, '$1-')
    event.target.value = value
    this.creditCard.number = value.replace(/-/g, '')
  }

  formatCVV(event: any): void {
    let value = event.target.value.replace(/\D/g, '')
    if (value.length > 4) {
      value = value.slice(0, 4)
    }
    event.target.value = value
    this.creditCard.cvv = value
  }
}
