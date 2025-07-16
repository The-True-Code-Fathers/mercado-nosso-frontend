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
import { DEVELOPMENT_CONFIG } from '../../../../shared/config/development.config'

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

  private router = inject(Router)
  private listingService = inject(ListingService)
  private messageService = inject(MessageService)
  private confirmationService = inject(ConfirmationService)

  private readonly userId = DEVELOPMENT_CONFIG.DEFAULT_USER_ID

  ngOnInit() {
    this.loadPurchases()
  }

  loadPurchases() {
    this.isLoading.set(true)

    // Simular carregamento de compras do usuário
    setTimeout(() => {
      const mockPurchases: MyPurchase[] = [
        {
          listingId: '1',
          sellerId: 'seller1',
          sku: 'IPHONE-001',
          productRecommendation: [],
          title: 'iPhone 14 Pro Max 256GB',
          description: 'iPhone seminovo em excelente estado',
          price: 4500,
          rating: 5,
          imagesUrl: ['/images/banner.png'],
          category: 'Eletrônicos',
          stock: 0,
          productCondition: 'USED',
          reviewsId: [],
          status: 'active',
          quantityPurchased: 1,
          purchaseDate: new Date('2024-01-15'),
        },
        {
          listingId: '2',
          sellerId: 'seller2',
          sku: 'BOOK-001',
          productRecommendation: [],
          title: 'Livro de JavaScript Avançado',
          description: 'Guia completo para desenvolvedores',
          price: 89.9,
          rating: 4,
          imagesUrl: ['/images/banner.png'],
          category: 'Livros e Educação',
          stock: 0,
          productCondition: 'NEW',
          reviewsId: [],
          status: 'active',
          quantityPurchased: 2,
          purchaseDate: new Date('2024-02-20'),
        },
      ]

      this.purchases.set(mockPurchases)
      this.isLoading.set(false)
    }, 1000)
  }

  viewPurchase(listingId: string) {
    this.router.navigate(['/listing', listingId])
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
