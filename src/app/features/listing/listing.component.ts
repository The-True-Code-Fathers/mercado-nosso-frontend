import { Component, OnInit, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import {
  ListingService,
  Listing,
  PagedListingResponse,
  SearchParams,
} from './services/listing.service'
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
  pagedResponse = signal<PagedListingResponse | null>(null)
  isLoading = signal<boolean>(false)
  error = signal<string | null>(null)

  selectedCondition = ''
  selectedCategory = ''
  searchTerm = ''
  minPrice: number | null = null
  maxPrice: number | null = null
  sortBy = 'NAME_ASC'
  selectedView = 'grid'
  showMobileFilters = false
  showMobileSorting = false

  // Pagination properties
  currentPage = 0
  itemsPerPage = 12
  totalItems = 0

  // Dropdown options
  conditionOptions: DropdownOption[] = [
    { label: 'Todas', value: '' },
    { label: 'Novo', value: 'NEW' },
    { label: 'Usado', value: 'USED' },
  ]

  sortOptions: DropdownOption[] = [
    { label: 'Mais relevante', value: 'NAME_ASC' },
    { label: 'Menor preço', value: 'PRICE_ASC' },
    { label: 'Maior preço', value: 'PRICE_DESC' },
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
    console.log('🏃 ListingComponent ngOnInit called')

    // Subscribe to query parameters and reload when they change
    this.route.queryParams.subscribe(params => {
      console.log('📍 URL params changed:', params)

      let shouldReload = false

      // Check if category parameter changed
      const newCategory = params['category'] || ''
      if (this.selectedCategory !== newCategory) {
        console.log(
          '📂 Category changed from',
          this.selectedCategory,
          'to',
          newCategory,
        )
        this.selectedCategory = newCategory
        shouldReload = true
      }

      // Check if search term parameter changed
      const newSearchTerm = params['name'] || ''
      if (this.searchTerm !== newSearchTerm) {
        console.log(
          '🔍 Search term changed from',
          this.searchTerm,
          'to',
          newSearchTerm,
        )
        this.searchTerm = newSearchTerm
        shouldReload = true
      }

      // Reset to first page when parameters change
      if (shouldReload) {
        console.log('🔄 Parameters changed, resetting to first page')
        this.currentPage = 0
      }

      // Always load listings (including initial load)
      console.log('🚀 Loading listings...')
      this.loadListings()
    })
  }

  loadListings(): void {
    this.isLoading.set(true)
    this.error.set(null)

    const searchParams: SearchParams = this.buildSearchParams()

    this.listingService.searchListingsPaginated(searchParams).subscribe({
      next: response => {
        this.pagedResponse.set(response)
        this.listings.set(response.content)
        this.totalItems = response.totalElements
        this.isLoading.set(false)
      },
      error: err => {
        this.error.set('Erro ao carregar produtos')
        this.isLoading.set(false)
        console.error('Erro ao carregar listings:', err)
      },
    })
  }

  private buildSearchParams(): SearchParams {
    const params: SearchParams = {
      page: this.currentPage,
      size: this.itemsPerPage,
    }

    // Combine search term and category into name parameter for searching
    let searchName = ''
    if (this.searchTerm) {
      searchName = this.searchTerm
    }
    if (this.selectedCategory) {
      searchName = searchName
        ? `${searchName} ${this.selectedCategory}`
        : this.selectedCategory
    }

    if (searchName) {
      params.name = searchName
    }

    if (this.selectedCondition) {
      params.condition = this.selectedCondition as 'NEW' | 'USED'
    }

    if (this.minPrice && this.minPrice > 0) {
      params.minPrice = this.minPrice
    }

    if (this.maxPrice && this.maxPrice > 0) {
      params.maxPrice = this.maxPrice
    }

    if (this.sortBy) {
      params.ordering = this.sortBy as any
    }

    console.log('🔧 Building search params:', {
      searchTerm: this.searchTerm,
      selectedCategory: this.selectedCategory,
      searchName,
      finalParams: params,
    })

    return params
  }

  onFilterChange(): void {
    this.currentPage = 0 // Reset to first page when filters change
    this.loadListings()
  }

  onSortChange(): void {
    this.currentPage = 0 // Reset to first page when sorting changes
    this.loadListings()
  }

  onPageChange(event: any): void {
    this.currentPage = event.page
    this.itemsPerPage = event.rows
    this.loadListings()
  }

  onSearchTermChange(): void {
    this.currentPage = 0 // Reset to first page when search term changes
    this.updateUrlParams()
    this.loadListings()
  }

  private updateUrlParams(): void {
    const queryParams: any = {}

    if (this.searchTerm) {
      queryParams['name'] = this.searchTerm
    }

    if (this.selectedCategory) {
      queryParams['category'] = this.selectedCategory
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge', // Keep other existing params
      replaceUrl: true, // Don't add to browser history
    })
  }

  selectCondition(condition: string): void {
    this.selectedCondition = condition
    this.currentPage = 0
    this.loadListings()
  }

  clearFilters(): void {
    this.selectedCondition = ''
    this.selectedCategory = ''
    this.searchTerm = ''
    this.minPrice = null
    this.maxPrice = null
    this.sortBy = 'NAME_ASC'
    this.currentPage = 0 // Reset to first page when clearing filters

    // Clear URL parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    })

    this.loadListings()
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters
    this.showMobileSorting = false // Close sorting when opening filters
  }

  toggleMobileSorting(): void {
    this.showMobileSorting = !this.showMobileSorting
    this.showMobileFilters = false // Close filters when opening sorting
  }

  selectSortOption(value: string): void {
    this.sortBy = value
    this.showMobileSorting = false // Close panel after selection
    this.onSortChange()
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
    this.loadListings()
  }

  clearMinPrice(): void {
    this.minPrice = null
    this.loadListings()
  }

  clearMaxPrice(): void {
    this.maxPrice = null
    this.loadListings()
  }

  clearCategory(): void {
    this.selectedCategory = ''
    this.loadListings()
  }

  clearSearchTerm(): void {
    this.searchTerm = ''
    this.updateUrlParams()
    this.loadListings()
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

  // Pagination navigation methods
  goToPage(page: number): void {
    this.currentPage = page
    this.loadListings()
  }

  nextPage(): void {
    const response = this.pagedResponse()
    if (response && response.hasNext) {
      this.goToPage(this.currentPage + 1)
    }
  }

  previousPage(): void {
    const response = this.pagedResponse()
    if (response && response.hasPrevious) {
      this.goToPage(this.currentPage - 1)
    }
  }

  firstPage(): void {
    this.goToPage(0)
  }

  lastPage(): void {
    const response = this.pagedResponse()
    if (response) {
      this.goToPage(response.totalPages - 1)
    }
  }

  // Helper method to build page numbers for pagination UI
  getPageNumbers(): number[] {
    const response = this.pagedResponse()
    if (!response) return []

    const maxVisible = 5
    const pages: number[] = []
    const half = Math.floor(maxVisible / 2)

    let start = Math.max(0, this.currentPage - half)
    let end = Math.min(response.totalPages - 1, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  // Check if pagination should be shown
  shouldShowPagination(): boolean {
    const response = this.pagedResponse()
    return response ? response.totalPages > 1 : false
  }
}
