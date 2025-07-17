import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { RadioButtonModule } from 'primeng/radiobutton'
import { InputTextModule } from 'primeng/inputtext'
import { DropdownModule } from 'primeng/dropdown'
import { MessageService } from 'primeng/api'
import { ToastModule } from 'primeng/toast'
import { CheckoutService } from '../../services/checkout.service'
import { ShippingAddress } from '../../models/checkout.models'

@Component({
  selector: 'app-shipping-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    RadioButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './shipping-step.component.html',
  styleUrl: './shipping-step.component.scss'
})
export class ShippingStepComponent implements OnInit {
  private checkoutService = inject(CheckoutService)
  private messageService = inject(MessageService)

  savedAddresses: ShippingAddress[] = []
  selectedAddressId: string | null = null
  newAddress: ShippingAddress = this.createEmptyAddress()

  states = [
    { name: 'São Paulo', code: 'SP' },
    { name: 'Rio de Janeiro', code: 'RJ' },
    { name: 'Minas Gerais', code: 'MG' },
    { name: 'Bahia', code: 'BA' },
    { name: 'Paraná', code: 'PR' },
    { name: 'Rio Grande do Sul', code: 'RS' },
    // Add more states as needed
  ]

  ngOnInit(): void {
    this.loadSavedAddresses()
  }

  private createEmptyAddress(): ShippingAddress {
    return {
      fullName: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    }
  }

  private loadSavedAddresses(): void {
    this.checkoutService.getMockAddresses().subscribe(addresses => {
      this.savedAddresses = addresses
      
      // Auto-select default address if available
      const defaultAddress = addresses.find(addr => addr.isDefault)
      if (defaultAddress) {
        this.selectedAddressId = defaultAddress.id!
        this.onAddressSelect(defaultAddress)
      }
    })
  }

  onAddressSelect(address: ShippingAddress): void {
    this.checkoutService.setShippingAddress(address)
  }

  onZipCodeChange(): void {
    const zipCode = this.newAddress.zipCode.replace(/\D/g, '')
    if (zipCode.length === 8) {
      // Mock address lookup - in real app, call CEP API
      this.mockAddressLookup(zipCode)
    }
  }

  private mockAddressLookup(zipCode: string): void {
    // Simulate API call to lookup address by ZIP code
    setTimeout(() => {
      this.newAddress = {
        ...this.newAddress,
        street: 'Rua das Flores',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP'
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'CEP encontrado',
        detail: 'Endereço preenchido automaticamente',
        life: 3000
      })
    }, 500)
  }

  canContinue(): boolean {
    if (this.selectedAddressId) {
      return true
    }
    
    // Check if new address is valid
    return !!(
      this.newAddress.fullName &&
      this.newAddress.street &&
      this.newAddress.number &&
      this.newAddress.neighborhood &&
      this.newAddress.city &&
      this.newAddress.state &&
      this.newAddress.zipCode
    )
  }

  continueToPayment(): void {
    if (!this.selectedAddressId) {
      // Use new address
      this.checkoutService.setShippingAddress(this.newAddress)
    }

    this.checkoutService.nextStep()
  }

  goBack(): void {
    this.checkoutService.previousStep()
  }
}
