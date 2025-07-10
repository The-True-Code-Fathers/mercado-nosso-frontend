import { Component, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { DecimalPipe, CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ListingService, Listing } from '../../services/listing.service'

@Component({
  selector: 'app-listing-detail',
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.scss'],
  standalone: true,
  imports: [DecimalPipe, CommonModule, FormsModule],
})
export class ListingDetailComponent implements OnInit {
  listingId: string | null = null
  selectedImageIndex = 0
  cep: string = ''
  freteCalculado: boolean = false
  previsaoEntrega: string = ''
  custoFrete: string = ''

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
  ) {}

  ngOnInit(): void {
    this.listingId = this.route.snapshot.paramMap.get('id')
    if (this.listingId) {
      this.loadListing(this.listingId)
    }
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

  selectImage(index: number) {
    this.selectedImageIndex = index
  }

  calcularFrete() {
    // Simulação de cálculo de frete
    this.freteCalculado = true
    this.custoFrete = 'R$ 25,00'
    this.previsaoEntrega = 'Receba até 18 de Julho'
  }

  get currentListing() {
    return this.listing() || null
  }

  get displayImages() {
    return this.defaultProduct.images
  }

  get displayTitle() {
    return this.currentListing?.title || 'Carregando...'
  }

  get displayPrice() {
    return this.currentListing?.price || 0
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
