import { Component, inject, signal, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Router } from '@angular/router'
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
  unitPrice: number // Preço unitário do produto (não muda)
  price: number // Preço total (unitPrice * quantity)
  quantity: number
  image: string
  category: string
  selected: boolean
  shippingPrice: number
  stock: number // Adicionando informação de estoque
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
    private router: Router,
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
        // Em vez de mostrar erro, mostrar carrinho vazio
        console.error('Erro ao carregar carrinho:', err)
        this.cartItems.set([]) // Carrinho vazio
        this.isLoading.set(false)
        this.updateTotals()

        // Opcional: mostrar toast informativo (sem bloquear a UI)
        this.messageService.add({
          severity: 'info',
          summary: 'Carrinho',
          detail: 'Seu carrinho está vazio',
          life: 3000,
        })
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
            sellerId: 'unknown',
            sku: `SKU-${item.listingId}`,
            productRecommendation: [],
            title: `Produto ${item.listingId}`,
            description: 'Produto não encontrado',
            price: item.price || 0,
            rating: 0,
            reviewsId: [],
            imagesUrl: [
              'https://via.placeholder.com/80x80?text=Não+Encontrado',
            ], // Placeholder para produto não encontrado
            category: 'OTHERS',
            stock: 0,
            productCondition: 'NEW' as const,
            active: true,
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
            console.log('Processando listing:', listing)
            console.log('ImagesUrl do listing:', listing.imagesUrl)

            const unitPrice =
              listing.price || cartItem.price / cartItem.quantity || 0

            // Usar a primeira imagem do array imagesUrl ou placeholder se não houver
            const productImage =
              listing.imagesUrl && listing.imagesUrl.length > 0
                ? listing.imagesUrl[0]
                : 'https://via.placeholder.com/80x80?text=📦'

            console.log('Imagem selecionada para o produto:', productImage)

            return {
              listingId: cartItem.listingId,
              name: listing.title || `Produto ${cartItem.listingId}`,
              unitPrice: unitPrice, // Preço unitário fixo
              price: cartItem.price || listing.price || 0, // Preço total do backend
              quantity: cartItem.quantity || 1,
              image: productImage, // Primeira imagem do array ou placeholder
              category: listing.category || 'Produto', // Categoria do listing
              selected: true,
              shippingPrice: cartItem.shippingPrice || 0,
              stock: listing.stock || 0, // Adicionando estoque do listing
            }
          },
        )

        console.log('Items mapeados com detalhes:', cartItems)
        this.cartItems.set(cartItems)
        this.updateTotalsFromBackend(cartResponse)
      },
      error: error => {
        console.error('Erro ao buscar detalhes dos produtos:', error)
        // Em vez de dados mocados, mostrar carrinho vazio
        this.cartItems.set([])
        this.updateTotals()

        this.messageService.add({
          severity: 'info',
          summary: 'Carrinho',
          detail: 'Seu carrinho está vazio',
          life: 3000,
        })
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
        unitPrice: 2.49, // Preço unitário
        price: 4.98, // Preço total (2.49 * 2)
        quantity: 2,
        image: 'https://via.placeholder.com/80x80?text=🍎',
        category: 'Frutas',
        selected: true,
        shippingPrice: 0.25,
        stock: 10, // Estoque disponível
      },
      {
        listingId: '2',
        name: 'Leite Integral',
        unitPrice: 3.5, // Preço unitário
        price: 3.5, // Preço total (3.5 * 1)
        quantity: 1,
        image: 'https://via.placeholder.com/80x80?text=🥛',
        category: 'Laticínios',
        selected: true,
        shippingPrice: 0.18,
        stock: 5, // Estoque disponível
      },
    ]

    this.cartItems.set(mockItems)
    this.updateTotals()
  }

  updateQuantity(itemId: string, newQuantity: number) {
    // Primeiro, verificar se o item existe e obter informações de estoque
    const currentItem = this.cartItems().find(item => item.listingId === itemId)
    if (!currentItem) {
      return
    }

    // Validar se a nova quantidade não excede o estoque disponível
    if (newQuantity > currentItem.stock) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Estoque Limitado',
        detail: `Apenas ${currentItem.stock} unidades disponíveis em estoque`,
      })
      return
    }

    if (newQuantity <= 0) {
      // Quando quantidade for 0, usar o método de remoção com confirmação
      this.confirmationService.confirm({
        message: 'Tem certeza que deseja remover este item do carrinho?',
        header: 'Confirmar Remoção',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: () => {
          // Usar o método de remoção múltipla (mesmo que removeSelectedItems)
          this.cartService.removeMultipleItemsFromCart([itemId]).subscribe({
            next: () => {
              // Como é assíncrono via Kafka, remover localmente
              this.cartItems.update(items =>
                items.filter(item => item.listingId !== itemId),
              )
              this.updateTotals()

              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Item removido do carrinho',
              })

              // Recarregar após delay para sincronizar com backend
              setTimeout(() => {
                this.loadCart()
              }, 1000)
            },
            error: err => {
              console.error('Erro ao remover item:', err)
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao remover item do carrinho',
              })

              // Restaurar quantidade para 1 em caso de erro
              this.restoreQuantityToOne(itemId)
            },
          })
        },
        reject: () => {
          // Se usuário cancelar, restaurar quantidade para 1
          this.restoreQuantityToOne(itemId)
        },
      })
      return
    }

    // Atualizar no backend normalmente para quantidades > 0
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
        item.listingId === itemId
          ? {
              ...item,
              quantity: newQuantity,
              price: item.unitPrice * newQuantity, // Recalcular preço total
            }
          : item,
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
        // Usar o mesmo método dos itens selecionados (removeMultipleItemsFromCart)
        this.cartService.removeMultipleItemsFromCart([itemId]).subscribe({
          next: () => {
            // Como é assíncrono via Kafka, remover localmente
            this.cartItems.update(items =>
              items.filter(item => item.listingId !== itemId),
            )
            this.updateTotals()

            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Item removido do carrinho',
            })

            // Recarregar após delay para sincronizar com backend
            setTimeout(() => {
              this.loadCart()
            }, 1000)
          },
          error: err => {
            console.error('Erro ao remover item:', err)
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao remover item do carrinho',
            })

            // Fallback: remover localmente
            this.removeItemLocally(itemId)
          },
        })
      },
    })
  }

  // Método alternativo usando remoção direta (caso necessário)
  removeItemDirectly(itemId: string) {
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
    // Usar o preço total já calculado ou calcular baseado no unitPrice
    const subtotalValue = selectedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
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
              items.filter(item => !selectedIds.includes(item.listingId)),
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

  navigateToProduct(listingId: string): void {
    window.open(`/listing/${listingId}`, '_blank')
  }

  private restoreQuantityToOne(itemId: string) {
    this.cartItems.update(items =>
      items.map(item =>
        item.listingId === itemId
          ? {
              ...item,
              quantity: 1,
              price: item.unitPrice * 1, // Recalcular preço para quantidade 1
            }
          : item,
      ),
    )
    this.updateTotals()

    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'Quantidade restaurada para 1',
    })
  }

  // Método para lidar com erro de carregamento de imagem
  onImageError(event: any, item: CartItem): void {
    console.error(
      'Erro ao carregar imagem:',
      event.target.src,
      'para o item:',
      item.name,
    )
    // Definir uma imagem de fallback
    event.target.src = 'https://via.placeholder.com/80x80?text=📦'
  }
}
