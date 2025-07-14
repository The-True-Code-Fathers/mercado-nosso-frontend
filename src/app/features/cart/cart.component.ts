import { Component, inject, signal, OnInit } from '@angular/core'
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
import { CartService, CartResponse } from './services/cart.service'
import { ListingService, Listing } from '../listing/services/listing.service'
import { forkJoin, of } from 'rxjs'
import { catchError } from 'rxjs/operators'

export interface CartItem {
  listingId: string
  name: string
  price: number
  quantity: number
  image: string
  category: string
  selected: boolean
  shippingPrice: number
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
export class CartComponent implements OnInit {
  private confirmationService = inject(ConfirmationService)
  private messageService = inject(MessageService)

  // Using signals for reactive state management
  cartItems = signal<CartItem[]>([])
  isLoading = signal<boolean>(false)
  error = signal<string | null>(null)

  // Computed signals for derived state
  totalItems = signal(0)
  subtotal = signal(0)
  delivery = signal(0)
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

  constructor(
    private cartService: CartService,
    private listingService: ListingService,
  ) {
    // Initialize totals
    this.updateTotals()
  }

  ngOnInit(): void {
    this.loadCart()
  }

  loadCart(): void {
    this.isLoading.set(true)
    this.error.set(null)

    this.cartService.getCart().subscribe({
      next: (cartResponse: CartResponse) => {
        this.mapCartResponseToItems(cartResponse)
        this.isLoading.set(false)
      },
      error: (err: any) => {
        this.error.set('Erro ao carregar o carrinho')
        this.isLoading.set(false)
        console.error('Erro ao carregar carrinho:', err)

        // Fallback para dados mocados em caso de erro
        this.loadMockData()
      },
    })
  }

  private mapCartResponseToItems(cartResponse: CartResponse): void {
    console.log('CartResponse recebido:', cartResponse)

    if (!cartResponse.items || cartResponse.items.length === 0) {
      this.cartItems.set([])
      this.updateTotalsFromBackend(cartResponse)
      return
    }

    // Buscar detalhes de todos os produtos em paralelo
    const listingRequests = cartResponse.items.map(item =>
      this.listingService.getListingById(item.listingId).pipe(
        catchError(error => {
          console.error(`Erro ao buscar listing ${item.listingId}:`, error)
          // Retorna um listing mocado em caso de erro
          return of({
            listingId: item.listingId,
            title: `Produto ${item.listingId}`,
            description: 'Produto não encontrado',
            price: item.price || 0,
            stock: 0,
            active: true,
            productCondition: 'Novo',
            createdAt: new Date().toISOString(),
          } as Listing)
        }),
      ),
    )

    forkJoin(listingRequests).subscribe({
      next: (listings: Listing[]) => {
        const cartItems: CartItem[] = cartResponse.items.map(
          (cartItem, index) => {
            const listing = listings[index]

            return {
              listingId: cartItem.listingId,
              name: listing.title || `Produto ${cartItem.listingId}`,
              price: cartItem.price || listing.price || 0,
              quantity: cartItem.quantity || 1,
              image: 'https://via.placeholder.com/80x80?text=📦', // Placeholder até implementar imagens
              category: 'Produto', // Categoria padrão até implementar categorias
              selected: true,
              shippingPrice: cartItem.shippingPrice || 0,
            }
          },
        )

        console.log('Items mapeados com detalhes:', cartItems)
        this.cartItems.set(cartItems)
        this.updateTotalsFromBackend(cartResponse)
      },
      error: error => {
        console.error('Erro ao buscar detalhes dos produtos:', error)
        // Fallback para dados mocados
        this.loadMockData()
      },
    })
  }

  private updateTotalsFromBackend(cartResponse: CartResponse): void {
    console.log('Atualizando totais do backend:', {
      subTotal: cartResponse.subTotal,
      shippingPriceTotal: cartResponse.shippingPriceTotal,
      grandTotal: cartResponse.grandTotal,
    })

    this.subtotal.set(cartResponse.subTotal || 0)
    this.delivery.set(cartResponse.shippingPriceTotal || 0)
    this.total.set(cartResponse.grandTotal || 0)

    // Calcular total de itens
    const itemCount = cartResponse.items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    )
    this.totalItems.set(itemCount)

    console.log('Totais definidos:', {
      subtotal: this.subtotal(),
      delivery: this.delivery(),
      total: this.total(),
      totalItems: this.totalItems(),
    })
  }

  private loadMockData(): void {
    // Dados mocados para desenvolvimento
    const mockItems: CartItem[] = [
      {
        listingId: '1',
        name: 'Maçã Gala',
        price: 4.99,
        quantity: 2,
        image: 'https://via.placeholder.com/80x80?text=🍎',
        category: 'Frutas',
        selected: true,
        shippingPrice: 0.25,
      },
      {
        listingId: '2',
        name: 'Leite Integral',
        price: 3.5,
        quantity: 1,
        image: 'https://via.placeholder.com/80x80?text=🥛',
        category: 'Laticínios',
        selected: true,
        shippingPrice: 0.18,
      },
    ]

    this.cartItems.set(mockItems)
    this.updateTotals()
  }

  updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeItem(itemId)
      return
    }

    // Atualizar no backend
    this.cartService.updateItemQuantity(itemId, newQuantity).subscribe({
      next: cartResponse => {
        this.mapCartResponseToItems(cartResponse)
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Quantidade atualizada',
        })
      },
      error: err => {
        console.error('Erro ao atualizar quantidade:', err)
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar quantidade',
        })

        // Fallback: atualizar localmente
        this.updateQuantityLocally(itemId, newQuantity)
      },
    })
  }

  private updateQuantityLocally(itemId: string, newQuantity: number) {
    this.cartItems.update(items =>
      items.map(item =>
        item.listingId === itemId ? { ...item, quantity: newQuantity } : item,
      ),
    )
    this.updateTotals()
  }

  toggleSelection(itemId: string) {
    this.cartItems.update(items =>
      items.map(item =>
        item.listingId === itemId
          ? { ...item, selected: !item.selected }
          : item,
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
        this.cartService.removeItemFromCart(itemId).subscribe({
          next: (updatedCart: CartResponse) => {
            // Atualizar carrinho com a resposta do servidor
            this.mapCartResponseToItems(updatedCart)
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Item removido do carrinho',
            })
          },
          error: err => {
            console.error('Erro ao remover item:', err)
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao remover item do carrinho',
            })

            // Fallback: remover localmente se o servidor falhar
            this.removeItemLocally(itemId)
          },
        })
      },
    })
  }

  private removeItemLocally(itemId: string) {
    this.cartItems.update(items =>
      items.filter(item => item.listingId !== itemId),
    )
    this.updateTotals()
  }

  clearCart() {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja limpar todo o carrinho?',
      header: 'Limpar Carrinho',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.cartService.clearCart().subscribe({
          next: () => {
            this.cartItems.set([])
            this.updateTotals()
            this.messageService.add({
              severity: 'info',
              summary: 'Carrinho Limpo',
              detail: 'Todos os itens foram removidos',
            })
          },
          error: err => {
            console.error('Erro ao limpar carrinho:', err)
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao limpar carrinho',
            })

            // Fallback: limpar localmente
            this.cartItems.set([])
            this.updateTotals()
          },
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

  // Método público para adicionar itens ao carrinho (pode ser chamado de outros componentes)
  addItemToCart(listingId: string, quantity: number = 1): void {
    this.cartService.addItemToCart(listingId, quantity).subscribe({
      next: cartResponse => {
        this.mapCartResponseToItems(cartResponse)
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Item adicionado ao carrinho',
        })
      },
      error: err => {
        console.error('Erro ao adicionar item:', err)
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao adicionar item ao carrinho',
        })
      },
    })
  }

  removeSelectedItems() {
    const selectedIds = this.cartItems()
      .filter(item => item.selected)
      .map(item => item.listingId)

    if (selectedIds.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Nenhum item selecionado',
      })
      return
    }

    this.confirmationService.confirm({
      message: `Tem certeza que deseja remover ${selectedIds.length} item(s) selecionado(s)?`,
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.cartService.removeMultipleItemsFromCart(selectedIds).subscribe({
          next: () => {
            // Como é assíncrono via Kafka, vamos remover localmente e recarregar
            this.cartItems.update(items =>
              items.filter(item => !selectedIds.includes(item.listingId))
            )
            this.updateTotals()
            
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `${selectedIds.length} item(s) removido(s) do carrinho`,
            })

            // Recarregar após um pequeno delay para sincronizar com o backend
            setTimeout(() => {
              this.loadCart()
            }, 1000)
          },
          error: err => {
            console.error('Erro ao remover itens selecionados:', err)
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao remover itens selecionados',
            })
          },
        })
      },
    })
  }
}
