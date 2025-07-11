import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { InputNumberModule } from 'primeng/inputnumber'
import { DividerModule } from 'primeng/divider'
import { BadgeModule } from 'primeng/badge'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ToastModule } from 'primeng/toast'
import { TooltipModule } from 'primeng/tooltip'
import { CheckboxModule } from 'primeng/checkbox'
import { ConfirmationService, MessageService } from 'primeng/api'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  category: string
  selected: boolean
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    InputNumberModule,
    DividerModule,
    BadgeModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    CheckboxModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  private confirmationService = inject(ConfirmationService)
  private messageService = inject(MessageService)

  // Using signals for reactive state management (Angular v19 feature)
  cartItems = signal<CartItem[]>([
    {
      id: '1',
      name: 'Maçã Gala',
      price: 4.99,
      quantity: 2,
      image: 'https://via.placeholder.com/80x80?text=🍎',
      category: 'Frutas',
      selected: true,
    },
    {
      id: '2',
      name: 'Leite Integral',
      price: 3.5,
      quantity: 1,
      image: 'https://via.placeholder.com/80x80?text=🥛',
      category: 'Laticínios',
      selected: true,
    },
    {
      id: '3',
      name: 'Pão Francês',
      price: 0.8,
      quantity: 6,
      image: 'https://via.placeholder.com/80x80?text=🍞',
      category: 'Padaria',
      selected: false,
    },
  ])

  // Computed signals for derived state
  totalItems = signal(0)
  subtotal = signal(0)
  delivery = signal(5.99)
  total = signal(0)

  // Getter for selected items count
  get selectedItemsCount(): number {
    return this.cartItems()
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  // Getter for total items in cart (regardless of selection)
  get totalItemsInCart(): number {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  }

  constructor() {
    // Update computed values when cart changes
    this.updateTotals()
  }

  updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeItem(itemId)
      return
    }

    this.cartItems.update(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    )
    this.updateTotals()
  }

  toggleSelection(itemId: string) {
    this.cartItems.update(items =>
      items.map(item =>
        item.id === itemId ? { ...item, selected: !item.selected } : item,
      ),
    )
    this.updateTotals()
  }

  removeItem(itemId: string) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja remover este item do carrinho?',
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.cartItems.update(items => items.filter(item => item.id !== itemId))
        this.updateTotals()
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Item removido do carrinho',
        })
      },
    })
  }

  clearCart() {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja limpar todo o carrinho?',
      header: 'Limpar Carrinho',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.cartItems.set([])
        this.updateTotals()
        this.messageService.add({
          severity: 'info',
          summary: 'Carrinho Limpo',
          detail: 'Todos os itens foram removidos',
        })
      },
    })
  }

  proceedToCheckout() {
    const selectedItems = this.cartItems().filter(item => item.selected)

    if (selectedItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nenhum Item Selecionado',
        detail: 'Selecione pelo menos um item para finalizar a compra',
      })
      return
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Checkout',
      detail: `Processando ${selectedItems.length} item(s) selecionado(s)...`,
    })
  }

  continueShopping() {
    // Navigate back to products - this would use Router in a real app
    this.messageService.add({
      severity: 'info',
      summary: 'Redirecionando',
      detail: 'Voltando para a lista de produtos...',
    })
  }

  private updateTotals() {
    const items = this.cartItems()
    const selectedItems = items.filter(item => item.selected)

    const itemCount = selectedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    )
    const subtotalValue = selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )

    this.totalItems.set(itemCount)
    this.subtotal.set(subtotalValue)

    // Delivery fee is 5% of purchase value
    const deliveryFee = subtotalValue * 0.05
    this.delivery.set(deliveryFee)
    this.total.set(subtotalValue + deliveryFee)
  }
}
