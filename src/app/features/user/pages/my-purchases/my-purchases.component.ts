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
import { DEVELOPMENT_CONFIG } from '../../../../shared/config/development.config'
import { forkJoin, of } from 'rxjs'
import { catchError, switchMap } from 'rxjs/operators'

export interface MyPurchase extends Listing {
  status: 'active' | 'outOfStock'
  quantityPurchased: number
  purchaseDate: Date
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
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './my-purchases.component.html',
  styleUrls: ['./my-purchases.component.scss'],
})
export class MyPurchasesComponent implements OnInit {
  purchases = signal<MyPurchase[]>([])
  isLoading = signal<boolean>(false)
  error = signal<string | null>(null)

  private router = inject(Router)
  private listingService = inject(ListingService)
  private userService = inject(UserService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)

  private readonly userId = DEVELOPMENT_CONFIG.DEFAULT_USER_ID

  ngOnInit() {
    this.loadPurchases()
  }

  loadPurchases() {
    this.isLoading.set(true)
    this.error.set(null)

    // Buscar dados do usuário para obter os IDs das compras
    this.userService
      .getCurrentUser(this.userId)
      .pipe(
        switchMap((user: UserResponse) => {
          console.log('Dados do usuário:', user)

          // Verificar se há compras
          if (!user.listingBoughtId || user.listingBoughtId.length === 0) {
            console.log('Usuário não tem compras')
            this.purchases.set([])
            this.isLoading.set(false)
            return of([])
          }

          console.log('IDs das compras:', user.listingBoughtId)

          // Buscar detalhes de todos os listings comprados
          const listingRequests = user.listingBoughtId.map(listingId =>
            this.listingService.getListingById(listingId).pipe(
              catchError(error => {
                console.error(`Erro ao buscar listing ${listingId}:`, error)
                return of(null) // Retorna null para listings não encontrados
              }),
            ),
          )

          return forkJoin(listingRequests)
        }),
        catchError(error => {
          console.error('Erro ao carregar compras:', error)
          this.error.set('Erro ao carregar suas compras. Tente novamente.')
          return of([])
        }),
      )
      .subscribe({
        next: (listings: (Listing | null)[]) => {
          console.log('Listings das compras:', listings)

          // Filtrar listings válidos e converter para MyPurchase
          const validListings = listings.filter(
            listing => listing !== null,
          ) as Listing[]
          const purchases: MyPurchase[] = validListings.map(listing => ({
            ...listing,
            status:
              listing.stock > 0
                ? 'active'
                : ('outOfStock' as 'active' | 'outOfStock'),
            quantityPurchased: 1, // Por enquanto assumimos 1, depois pode vir do histórico de compras
            purchaseDate: new Date(listing.createdAt || new Date()), // Usando data de criação como proxy
          }))

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
    this.messageService.add({
      severity: 'info',
      summary: 'Avaliação',
      detail: `Funcionalidade de avaliação em desenvolvimento para ${purchase.title}`,
    })
  }

  contactSeller(purchase: MyPurchase) {
    this.messageService.add({
      severity: 'info',
      summary: 'Contato',
      detail: `Funcionalidade de contato em desenvolvimento para ${purchase.title}`,
    })
  }
}
