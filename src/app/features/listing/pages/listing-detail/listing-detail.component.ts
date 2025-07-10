import { Component, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { DecimalPipe, CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ListingService, Listing } from '../../services/listing.service'

// PrimeNG imports
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { CardModule } from 'primeng/card'
import { RatingModule } from 'primeng/rating'
import { TagModule } from 'primeng/tag'
import { DividerModule } from 'primeng/divider'
import { BadgeModule } from 'primeng/badge'
import { GalleriaModule } from 'primeng/galleria'
import { PanelModule } from 'primeng/panel'
import { SkeletonModule } from 'primeng/skeleton'

export interface ShippingOption {
  type: string
  cost: number
  days: number
  description: string
  icon: string
}

@Component({
  selector: 'app-listing-detail',
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.scss'],
  standalone: true,
  imports: [
    DecimalPipe,
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    RatingModule,
    TagModule,
    DividerModule,
    BadgeModule,
    GalleriaModule,
    PanelModule,
    SkeletonModule,
  ],
})
export class ListingDetailComponent implements OnInit {
  listingId: string | null = null
  cep: string = ''
  freteCalculado: boolean = false
  shippingOptions: ShippingOption[] = []
  productRating: number = 4.8

  // Gallery images for PrimeNG Galleria
  galleriaImages: any[] = []

  // Using signal for reactive state management
  listing = signal<Listing | null>(null)
  isLoading = signal<boolean>(false)
  error = signal<string | null>(null)

  // Propriedades mockadas para exibição quando não há dados da API
  defaultProduct = {
    id: 1,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_2X_825234-MLA51585701313_092022-F.webp',
      'https://http2.mlstatic.com/D_NQ_NP_2X_825234-MLA51585701313_092022-O.webp',
    ],
    rating: 4.8,
    reviews: 120,
    comments: [
      { user: 'João', comment: 'Produto excelente!' },
      { user: 'Maria', comment: 'Chegou rápido e bem embalado.' },
    ],
    sold: 320,
    shipping: 'Frete grátis para todo o Brasil',
    deliveryEstimate: 'Receba até 15 de Julho',
    installments: '12x de R$ 83,33 sem juros',
    seller: {
      name: 'Loja Oficial Intel',
      reputation: 'Ótima',
      sales: 1500,
    },
  }

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
  ) {
    this.initializeGalleryImages()
  }

  ngOnInit(): void {
    this.listingId = this.route.snapshot.paramMap.get('id')
    if (this.listingId) {
      this.loadListing(this.listingId)
    }
  }

  private initializeGalleryImages(): void {
    this.galleriaImages = this.defaultProduct.images.map((img, index) => ({
      itemImageSrc: img,
      thumbnailImageSrc: img,
      alt: `Imagem ${index + 1}`,
      title: `Produto - Imagem ${index + 1}`,
    }))
  }

  loadListing(id: string): void {
    this.isLoading.set(true)
    this.error.set(null)

    this.listingService.getListingById(id).subscribe({
      next: listing => {
        this.listing.set(listing)
        this.isLoading.set(false)
      },
      error: err => {
        this.error.set('Erro ao carregar o produto')
        this.isLoading.set(false)
        console.error('Erro ao carregar listing:', err)
      },
    })
  }

  formatCep(event: any) {
    let value = event.target.value.replace(/\D/g, '') // Remove todos os caracteres não numéricos

    // Limita a 8 dígitos
    if (value.length > 8) {
      value = value.substring(0, 8)
    }

    // Adiciona o hífen após o 5º caractere
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5)
    }

    // Atualiza o valor no input e no modelo
    event.target.value = value
    this.cep = value
  }

  calcularFrete() {
    if (!this.cep || this.cep.length < 8) {
      return
    }

    // Simulação de cálculo de frete com SEDEX e PAC
    this.freteCalculado = true
    const precoAtual = this.currentListing?.price || 0

    // Calcula frete base (5% do preço)
    const freteBase = precoAtual * 0.05

    // SEDEX (mais caro, mais rápido)
    const sedexCost = freteBase * 1.5 // 50% mais caro
    const sedexDays = Math.floor(Math.random() * 3) + 1 // 1-3 dias

    // PAC (mais barato, mais devagar)
    const pacCost = freteBase
    const pacDays = Math.floor(Math.random() * 5) + 5 // 5-9 dias

    this.shippingOptions = [
      {
        type: 'SEDEX',
        cost: sedexCost,
        days: sedexDays,
        description: 'Entrega expressa',
        icon: 'pi pi-bolt',
      },
      {
        type: 'PAC',
        cost: pacCost,
        days: pacDays,
        description: 'Entrega econômica',
        icon: 'pi pi-truck',
      },
    ]
  }

  get currentListing() {
    return this.listing() || null
  }

  get displayImages() {
    return this.defaultProduct.images
  }

  get displayTitle() {
    return (
      this.currentListing?.title ||
      'Processador Intel Core i7-12700K - 12 Núcleos, 3.6GHz até 5.0GHz, Cache 25MB'
    )
  }

  get displayPrice() {
    return this.currentListing?.price || 1000
  }

  get displayDescription() {
    return this.currentListing?.description || 'Carregando descrição...'
  }

  get displayStock() {
    return this.currentListing?.stock || 0
  }

  get displayCondition() {
    return this.currentListing?.productCondition || 'Novo'
  }

  get starsArray() {
    return Array(5).fill(0)
  }

  get filledStars() {
    return Math.round(this.defaultProduct.rating)
  }
}
