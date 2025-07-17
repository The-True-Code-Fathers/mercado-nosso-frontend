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

  private router = inject(Router)
  private listingService = inject(ListingService)
  private userService = inject(UserService)
  private orderService = inject(OrderService)
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
              // Filtrar listings válidos e converter para MyPurchase
              const validListings = listings.filter(
                (listing): listing is Listing => listing !== null,
              )

              const purchases: MyPurchase[] = validListings.map(listing => {
                // Encontrar a order correspondente
                const order = orders.find(o =>
                  o.listingID.includes(listing.listingId),
                )

                return {
                  ...listing,
                  status:
                    listing.stock > 0
                      ? 'active'
                      : ('outOfStock' as 'active' | 'outOfStock'),
                  quantityPurchased: 1, // Por enquanto assumimos 1
                  purchaseDate: new Date(
                    order?.creationTime || listing.createdAt || new Date(),
                  ),
                  orderId: order?.orderId || '',
                  orderStatus: order?.status || 'OPEN',
                }
              })

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
          this.isLoading.set(false)
        },
        error: error => {
          console.error('Erro final:', error)
          this.error.set('Erro ao carregar suas compras. Tente novamente.')
          this.isLoading.set(false)
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
    this.selectedPurchase.set(purchase)
    this.showReviewModal.set(true)
  }

  onReviewSubmitted() {
    // Fechar modal e recarregar se necessário
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
