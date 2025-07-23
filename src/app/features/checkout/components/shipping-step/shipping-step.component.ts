import { Component, inject, OnInit } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { UserService, UserResponse } from '../../../user/services/user.service'
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
import { CheckoutNavigationComponent } from '../shared/checkout-navigation/checkout-navigation.component'

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
    ToastModule,
    CheckoutNavigationComponent,
  ],
  providers: [MessageService],
  templateUrl: './shipping-step.component.html',
  styleUrl: './shipping-step.component.scss',
})
export class ShippingStepComponent implements OnInit {
  private checkoutService = inject(CheckoutService)
  private messageService = inject(MessageService)
  private http = inject(HttpClient)
  private userService = inject(UserService)

  savedAddresses: ShippingAddress[] = []
  selectedAddressId: string | null = null
  newAddress: ShippingAddress = this.createEmptyAddress()
  showNewAddressForm: boolean = false

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
    this.prefillAddressFromUserCep()
  }

  toggleNewAddressForm(): void {
    this.showNewAddressForm = !this.showNewAddressForm

    // If showing the form, clear any selected address
    if (this.showNewAddressForm) {
      this.selectedAddressId = 'new'
      this.newAddress = this.createEmptyAddress()
    }
  }

  selectNewAddress(): void {
    this.selectedAddressId = 'new'
    this.showNewAddressForm = true
    this.newAddress = this.createEmptyAddress()
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
      zipCode: '',
    }
  }

  private loadSavedAddresses(): void {
    this.checkoutService.getShippingAddresses().subscribe(addresses => {
      this.savedAddresses = addresses
      // Auto-select default address if available
      const defaultAddress = addresses.find(addr => addr.isDefault)
      if (defaultAddress) {
        this.selectedAddressId = defaultAddress.id!
        this.onAddressSelect(defaultAddress)
      }
      // Show form if no saved addresses
      if (addresses.length === 0) {
        this.showNewAddressForm = true
        this.selectedAddressId = 'new'
        // Buscar nome do usuário para preencher automaticamente
        const userId = localStorage.getItem('userId') || '1'
        this.userService.getUserById(userId).subscribe({
          next: (user: UserResponse) => {
            this.newAddress.fullName = user.fullName || ''
            if (!user.cep || user.cep.trim() === '') {
              this.messageService.add({
                severity: 'warn',
                summary: 'CEP não cadastrado',
                detail:
                  'Cadastre um CEP no seu perfil para facilitar o preenchimento do endereço.',
                life: 6000,
              })
            }
          },
        })
      }
    })
  }

  onAddressSelect(address: ShippingAddress): void {
    console.log('Selected address:', address)

    // Set the selected address ID
    this.selectedAddressId = address.id || null

    // Set the selected address in the service
    this.checkoutService.setShippingAddress(address)

    // Clear the new address form since we're using a saved address
    this.newAddress = this.createEmptyAddress()
    this.showNewAddressForm = false
  }

  onZipCodeChange(): void {
    const zipCode = this.newAddress.zipCode.replace(/\D/g, '')
    if (zipCode.length === 8) {
      // Mock address lookup - in real app, call CEP API
      this.mockAddressLookup(zipCode)
    }
  }

  onNewAddressFieldChange(): void {
    // When user starts typing in new address form, ensure new address is selected
    if (this.selectedAddressId !== 'new') {
      this.selectedAddressId = 'new'
      this.showNewAddressForm = true
    }
  }

  private mockAddressLookup(zipCode: string): void {
    // Consulta real na BrasilAPI
    this.http
      .get<any>(`https://brasilapi.com.br/api/cep/v2/${zipCode}`)
      .subscribe({
        next: data => {
          this.newAddress = {
            ...this.newAddress,
            street: data.street || '',
            neighborhood: data.neighborhood || '',
            city: data.city || '',
            state: data.state || '',
          }
          this.messageService.add({
            severity: 'success',
            summary: 'CEP encontrado',
            detail: 'Endereço preenchido automaticamente',
            life: 3000,
          })
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao buscar CEP',
            detail:
              'Não foi possível encontrar o endereço para o CEP informado',
            life: 3000,
          })
        },
      })
  }

  // Busca o CEP do usuário logado e preenche o endereço automaticamente
  private prefillAddressFromUserCep(): void {
    const userId = localStorage.getItem('userId') || '1'
    this.userService.getUserById(userId).subscribe({
      next: (user: UserResponse) => {
        if (user.cep) {
          const zipCode = user.cep.replace(/\D/g, '')
          if (zipCode.length === 8) {
            this.newAddress.zipCode = user.cep
            this.mockAddressLookup(zipCode)
          }
        }
      },
      error: err => {
        // Não faz nada se não encontrar usuário ou cep
      },
    })
  }

  canContinue(): boolean {
    // If a saved address is selected, we can continue
    if (this.selectedAddressId && this.selectedAddressId !== 'new') {
      return true
    }

    // If new address is selected, check if all required fields are filled
    if (this.selectedAddressId === 'new') {
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

    return false
  }

  continueToPayment(): void {
    // If new address is selected, use the new address
    if (this.selectedAddressId === 'new') {
      console.log('Using new address:', this.newAddress)
      this.checkoutService.setShippingAddress(this.newAddress)

      this.messageService.add({
        severity: 'success',
        summary: 'Endereço salvo',
        detail: 'Novo endereço definido para entrega',
        life: 3000,
      })
    }

    this.checkoutService.nextStep()
  }

  goBack(): void {
    this.checkoutService.previousStep()
  }
}
