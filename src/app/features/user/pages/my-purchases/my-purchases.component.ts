import { Component, OnInit, signal, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'

// PrimeNG imports
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { TagModule } from 'primeng/tag'
import { BadgeModule } from 'primeng/badge'
import { SkeletonModule } from 'primeng/skeleton'
import { ToastModule } from 'primeng/toast'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { MessageService, ConfirmationService } from 'primeng/api'

// Services
import {
  ListingService,
  Listing,
} from '../../../listing/services/listing.service'
import { UserService, UserResponse } from '../../services/user.service'
import { OrderService, Order } from '../../services/order.service'
import { ReviewService, ReviewResponse } from '../../services/review.service'
import { DEVELOPMENT_CONFIG } from '../../../../shared/config/development.config'
import { forkJoin, of } from 'rxjs'
import { catchError, switchMap, map } from 'rxjs/operators'

// Components
import { ReviewModalComponent } from '../../components/review-modal.component'

export interface MyPurchase extends Listing {
  status: 'active' | 'outOfStock'
  quantityPurchased: number
  purchaseDate: Date
  orderId: string
  orderStatus: Order['status']
}

@Component({
  selector: 'app-my-purchases',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    BadgeModule,
    SkeletonModule,
    ToastModule,
    ConfirmDialogModule,
    ReviewModalComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './my-purchases.component.html',
  styleUrls: ['./my-purchases.component.scss'],
})
export class MyPurchasesComponent implements OnInit {
  purchases = signal<MyPurchase[]>([])
  isLoading = signal<boolean>(false)
  error = signal<string | null>(null)

  // Review Modal
  showReviewModal = signal<boolean>(false)
  selectedPurchase = signal<MyPurchase | null>(null)

  // Track which listings have been reviewed
  reviewedListings = signal<Set<string>>(new Set())

  private router = inject(Router)
  private listingService = inject(ListingService)
  private userService = inject(UserService)
  private orderService = inject(OrderService)
  private reviewService = inject(ReviewService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)

  private readonly userId = DEVELOPMENT_CONFIG.DEFAULT_USER_ID

  ngOnInit() {
    this.loadPurchases()
  }

  loadPurchases() {
    this.isLoading.set(true)
    this.error.set(null)

    // Buscar todas as orders do usuário
    this.orderService
      .getAllOrdersByBuyer(this.userId)
      .pipe(
        switchMap((orders: Order[]) => {
          console.log('Orders do usuário:', orders)

          // Verificar se há orders
          if (!orders || orders.length === 0) {
            console.log('Usuário não tem compras')
            this.purchases.set([])
            this.isLoading.set(false)
            return of([])
          }

          // Extrair todos os listingIDs de todas as orders
          const allListingIds: string[] = []

          orders.forEach(order => {
            order.listingID.forEach(listingId => {
              allListingIds.push(listingId)
            })
          })

          console.log('IDs dos listings das compras:', allListingIds)

          // Buscar detalhes de todos os listings
          const listingRequests = allListingIds.map(listingId =>
            this.listingService.getListingById(listingId).pipe(
              catchError(error => {
                console.error(`Erro ao buscar listing ${listingId}:`, error)
                return of(null) // Retorna null para listings não encontrados
              }),
            ),
          )

          return forkJoin(listingRequests).pipe(
            map((listings: (Listing | null)[]) => {
              // Filtrar listings válidos
              const validListings = listings.filter(
                (listing): listing is Listing => listing !== null,
              )

              // Contar quantas vezes cada listing aparece nas orders
              const listingQuantities = new Map<string, number>()
              orders.forEach(order => {
                order.listingID.forEach(listingId => {
                  const currentQuantity = listingQuantities.get(listingId) || 0
                  listingQuantities.set(listingId, currentQuantity + 1)
                })
              })

              // Agrupar listings únicos e calcular quantidades
              const uniquePurchases = new Map<string, MyPurchase>()

              validListings.forEach(listing => {
                if (!uniquePurchases.has(listing.id)) {
                  const order = orders.find(o =>
                    o.listingID.includes(listing.id),
                  )

                  const purchase: MyPurchase = {
                    ...listing,
                    status:
                      listing.stock > 0
                        ? 'active'
                        : ('outOfStock' as 'active' | 'outOfStock'),
                    quantityPurchased: listingQuantities.get(listing.id) || 1,
                    purchaseDate: new Date(
                      order?.creationTime || listing.createdAt || new Date(),
                    ),
                    orderId: order?.orderId || '',
                    orderStatus: order?.status || 'OPEN',
                  }

                  uniquePurchases.set(listing.id, purchase)
                }
              })

              // Converter para array e ordenar por data de compra (mais recente primeiro)
              const purchases: MyPurchase[] = Array.from(
                uniquePurchases.values(),
              ).sort(
                (a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime(),
              )

              console.log('Compras agrupadas:', purchases)
              return purchases
            }),
          )
        }),
        catchError(error => {
          console.error('Erro ao carregar compras:', error)
          this.error.set('Erro ao carregar suas compras. Tente novamente.')
          this.isLoading.set(false)
          return of([])
        }),
      )
      .subscribe({
        next: (purchases: MyPurchase[]) => {
          console.log('Compras processadas:', purchases)
          this.purchases.set(purchases)

          // Verificar quais produtos já foram avaliados
          this.checkExistingReviews(purchases)

          this.isLoading.set(false)
        },
        error: error => {
          console.error('Erro final:', error)
          this.error.set('Erro ao carregar suas compras. Tente novamente.')
          this.isLoading.set(false)
        },
      })
  }

  checkExistingReviews(purchases: MyPurchase[]) {
    const listingIds = purchases.map(purchase => purchase.id)

    if (listingIds.length === 0) return

    this.reviewService
      .checkUserReviewsForListings(listingIds, this.userId)
      .subscribe({
        next: reviewMap => {
          const reviewedIds = new Set(Object.keys(reviewMap))
          this.reviewedListings.set(reviewedIds)
          console.log('Produtos já avaliados:', reviewedIds)
        },
        error: error => {
          console.error('Erro ao verificar avaliações existentes:', error)
        },
      })
  }

  viewPurchase(listingId: string) {
    this.router.navigate(['/listing', listingId])
  }

  reloadPurchases() {
    this.loadPurchases()
  }

  ratePurchase(purchase: MyPurchase) {
    // Verificar se já foi avaliado
    if (this.reviewedListings().has(purchase.id)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Você já avaliou este produto.',
      })
      return
    }

    this.selectedPurchase.set(purchase)
    this.showReviewModal.set(true)
  }

  onReviewSubmitted() {
    // Adicionar o produto à lista de avaliados
    const purchase = this.selectedPurchase()
    if (purchase) {
      const updatedReviewed = new Set(this.reviewedListings())
      updatedReviewed.add(purchase.id)
      this.reviewedListings.set(updatedReviewed)
    }

    // Fechar modal
    this.showReviewModal.set(false)
    this.selectedPurchase.set(null)
  }

  contactSeller(purchase: MyPurchase) {
    this.messageService.add({
      severity: 'info',
      summary: 'Contato',
      detail: `Funcionalidade de contato em desenvolvimento para ${purchase.title}`,
    })
  }

  getOrderStatusLabel(status: Order['status']): string {
    const statusMap: Record<Order['status'], string> = {
      OPEN: 'Processando',
      PROCESSING: 'Em Processamento',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado',
    }
    return statusMap[status] || 'Processando'
  }

  getOrderStatusSeverity(
    status: Order['status'],
  ): 'success' | 'info' | 'warning' | 'danger' {
    const severityMap: Record<
      Order['status'],
      'success' | 'info' | 'warning' | 'danger'
    > = {
      OPEN: 'info',
      PROCESSING: 'warning',
      SHIPPED: 'info',
      DELIVERED: 'success',
      CANCELLED: 'danger',
    }
    return severityMap[status] || 'info'
  }
}
