import { Component, OnInit, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ListingService, Listing } from './services/listing.service'
import {
  ProductCardComponent,
  ProductCardData,
} from '../../shared/components/product-card/product-card.component'

// PrimeNG Imports
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { InputNumberModule } from 'primeng/inputnumber'
import { DropdownModule } from 'primeng/dropdown'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { ChipModule } from 'primeng/chip'
import { SelectButtonModule } from 'primeng/selectbutton'
import { TooltipModule } from 'primeng/tooltip'
import { MessageService } from 'primeng/api'
import { ToastModule } from 'primeng/toast'
import { PaginatorModule } from 'primeng/paginator'

interface DropdownOption {
  label: string
  value: string
}

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ProgressSpinnerModule,
    ChipModule,
    SelectButtonModule,
    TooltipModule,
    ToastModule,
    PaginatorModule,
  ],
  providers: [MessageService],
})
export class ListingComponent implements OnInit {
  listings = signal<Listing[]>([])
  filteredListings = signal<Listing[]>([])
  paginatedListings = signal<Listing[]>([])
  isLoading = signal<boolean>(false)
  error = signal<string | null>(null)

  selectedCondition = ''
  selectedCategory = ''
  minPrice: number | null = null
  maxPrice: number | null = null
  sortBy = 'title'
  selectedView = 'grid'
  showMobileFilters = false

  // Pagination properties
  currentPage = 0
  itemsPerPage = 12
  totalItems = 0

  // Dropdown options
  conditionOptions: DropdownOption[] = [
    { label: 'Todas', value: '' },
    { label: 'Novo', value: 'new' },
    { label: 'Usado', value: 'used' },
  ]

  sortOptions: DropdownOption[] = [
    { label: 'Mais relevante', value: 'title' },
    { label: 'Menor preço', value: 'lowestPrice' },
    { label: 'Maior preço', value: 'highestPrice' },
  ]

  viewOptions: DropdownOption[] = [
    { label: 'Grade', value: 'grid' },
    { label: 'Lista', value: 'list' },
  ]

  constructor(
    private listingService: ListingService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    // Subscribe to query parameters
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category']
      }
    })

    this.loadListings()
  }

  loadListings(): void {
    this.isLoading.set(true)
    this.error.set(null)

    this.listingService.getAllListings().subscribe({
      next: listings => {
        this.listings.set(listings)
        this.applyFilters()
        this.isLoading.set(false)
      },
      error: err => {
        this.error.set('Erro ao carregar produtos')
        this.isLoading.set(false)
        console.error('Erro ao carregar listings:', err)
      },
    })
  }

  onFilterChange(): void {
    this.currentPage = 0 // Reset to first page when filters change
    this.applyFilters()
  }

  onSortChange(): void {
    this.currentPage = 0 // Reset to first page when sorting changes
    this.applyFilters()
  }

  onPageChange(event: any): void {
    this.currentPage = event.page
    this.itemsPerPage = event.rows
    this.updatePaginatedListings()
  }

  selectCondition(condition: string): void {
    this.selectedCondition = condition
    this.applyFilters()
  }

  clearFilters(): void {
    this.selectedCondition = ''
    this.selectedCategory = ''
    this.minPrice = null
    this.maxPrice = null
    this.sortBy = 'title'
    this.currentPage = 0 // Reset to first page when clearing filters
    this.applyFilters()
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters
  }

  // Helper methods for active filters display
  hasActiveFilters(): boolean {
    return !!(
      this.selectedCondition ||
      this.minPrice ||
      this.maxPrice ||
      this.selectedCategory
    )
  }

  getActiveFiltersCount(): number {
    let count = 0
    if (this.selectedCondition) count++
    if (this.minPrice) count++
    if (this.maxPrice) count++
    if (this.selectedCategory) count++
    return count
  }

  clearCondition(): void {
    this.selectedCondition = ''
    this.applyFilters()
  }

  clearMinPrice(): void {
    this.minPrice = null
    this.applyFilters()
  }

  clearMaxPrice(): void {
    this.maxPrice = null
    this.applyFilters()
  }

  clearCategory(): void {
    this.selectedCategory = ''
    this.applyFilters()
  }

  getConditionLabel(value: string): string {
    const option = this.conditionOptions.find(opt => opt.value === value)
    return option?.label || value
  }

  // Product card integration methods
  mapListingToProductCard(listing: Listing): ProductCardData {
    return {
      id: listing.listingId,
      title: listing.title,
      price: listing.price,
      image: '/images/placeholder.png', // Default placeholder since Listing doesn't have image
      condition: listing.productCondition,
      stock: listing.stock,
      category: this.selectedCategory || 'Geral',
    }
  }

  onAddToCart(productCard: ProductCardData): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Produto adicionado',
      detail: `${productCard.title} foi adicionado ao carrinho`,
      life: 3000,
    })
  }

  onViewDetails(productCard: ProductCardData): void {
    this.router.navigate(['/listing', productCard.id])
  }

  trackByListingId(index: number, listing: Listing): string {
    return listing.listingId
  }

  private updatePaginatedListings(): void {
    const startIndex = this.currentPage * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    const paginatedItems = this.filteredListings().slice(startIndex, endIndex)
    this.paginatedListings.set(paginatedItems)
  }

  private applyFilters(): void {
    let filtered = [...this.listings()]

    // Apply category filter (from query params)
    if (this.selectedCategory) {
      const categoryLower = this.selectedCategory.toLowerCase()
      filtered = filtered.filter(
        listing =>
          listing.title.toLowerCase().includes(categoryLower) ||
          listing.description.toLowerCase().includes(categoryLower),
      )
    }

    // Apply condition filter
    if (this.selectedCondition) {
      filtered = filtered.filter(
        listing =>
          listing.productCondition.toLowerCase() ===
          this.selectedCondition.toLowerCase(),
      )
    }

    // Apply price filters
    if (this.minPrice && this.minPrice > 0) {
      filtered = filtered.filter(listing => listing.price >= this.minPrice!)
    }

    if (this.maxPrice && this.maxPrice > 0) {
      filtered = filtered.filter(listing => listing.price <= this.maxPrice!)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price':
          return a.price - b.price
        case 'recent':
          // Assuming we have a date field, otherwise sort by listingId as proxy
          return b.listingId.localeCompare(a.listingId)
        case 'title':
        default:
          return a.title.localeCompare(b.title)
      }
    })

    this.filteredListings.set(filtered)
    this.totalItems = filtered.length
    this.updatePaginatedListings()
  }
}
