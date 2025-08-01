import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  RouterModule,
  Router,
  NavigationEnd,
  ActivatedRoute,
} from '@angular/router'
import { FormsModule } from '@angular/forms'
import { Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'
import { SearchService } from '../../../services/search.service'
import {
  clearDevelopmentUserId,
  DEVELOPMENT_CONFIG,
} from '../../../config/development.config'
import { ButtonModule } from 'primeng/button'
import { BadgeModule } from 'primeng/badge'
import { TooltipModule } from 'primeng/tooltip'
import { InputTextModule } from 'primeng/inputtext'
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { OverlayPanelModule } from 'primeng/overlaypanel'
import { OverlayPanel } from 'primeng/overlaypanel'
import {
  UserService,
  UserResponse,
} from '../../../../features/user/services/user.service'
// import { CartService } from '../../core/services/cart.service'; // Uncomment when cart service is implemented


import { Document } from 'bson';
import { ListingService } from '../../../../features/listing/services/listing.service'



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    BadgeModule,
    TooltipModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    OverlayPanelModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  logout() {
    clearDevelopmentUserId()
    this.syncLoginState()
    this.username = null
    this.router.navigate(['/login'])
  }
  @ViewChild('categoriesPanel') categoriesPanel!: OverlayPanel
  @ViewChild('userMenuPanel') userMenuPanel!: OverlayPanel

  isDarkMode = false
  searchTerm: string = ''
  categoriesMenuVisible = false
  mobileMenuVisible = false
  mobileCategoriesVisible = false
  mobileSearchVisible = false
  userMenuVisible = false
  cartItemsCount = 3
  username: string | null = ''
  isLoggedIn = false
  isDashboardRoute = false // Track if current route is dashboard

  // Responsive properties
  isMobile = false
  isTablet = false
  isDesktop = false
  currentScreenSize = 'desktop'

  // Breakpoint constants
  private readonly MOBILE_BREAKPOINT = 768
  private readonly TABLET_BREAKPOINT = 1024
  private readonly DESKTOP_BREAKPOINT = 1200

  private hoverTimeout: any
  private subscriptions: Subscription[] = []

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private searchService: SearchService, // private cartService: CartService // Inject when available
    private userService: UserService,
    private listingService: ListingService
  ) {}

  categories: Document[] = [];
  quickCategories: Document[] = [];

  ngOnInit() {
    this.loadCategories()
    this.checkScreenSize()
    this.syncLoginState()
    this.loadUsername()
    window.addEventListener('storage', this.handleStorageChange)

    // Check initial route
    this.isDashboardRoute = this.router.url.includes('/dashboard')

    // Subscribe to search term changes from the service
    const searchTermSub = this.searchService.searchTerm$.subscribe(term => {
      this.searchTerm = term
    })
    this.subscriptions.push(searchTermSub)

    // Listen to route changes to clear search on home navigation e dar F5 na home
    const routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.syncLoginState()
        if (event.url === '/' || event.url === '/home') {
          this.searchService.clearSearchTerm()
        }
        // Check if current route is dashboard
        this.isDashboardRoute = event.url.includes('/dashboard')
      })
    this.subscriptions.push(routerSub)

    // TODO: Subscribe to cart service to get real-time cart count
    // this.cartService.cartItems$.subscribe(items => {
    //   this.cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);
    // });
  }

  ngOnDestroy() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout)
    }
    window.removeEventListener('storage', this.handleStorageChange)
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe())
    // TODO: Unsubscribe from cart service
  }

  handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'devUserId') {
      this.syncLoginState()
    }
  }

  onCategoriesHover(event: Event) {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout)
    }
    this.categoriesPanel.show(event)
  }

  onCategoriesLeave() {
    this.hoverTimeout = setTimeout(() => {
      this.categoriesPanel.hide()
    }, 300) // 300ms delay before hiding
  }

  onOverlayPanelEnter() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout)
    }
  }

  onOverlayPanelLeave() {
    this.hoverTimeout = setTimeout(() => {
      this.categoriesPanel.hide()
    }, 300)
  }

  onCategorySelected() {
    this.categoriesPanel.hide()
  }

  // User menu methods
  toggleUserMenu(event: Event) {
    this.userMenuPanel.toggle(event)
    this.userMenuVisible = !this.userMenuVisible
  }

  closeUserMenu() {
    this.userMenuPanel.hide()
    this.userMenuVisible = false
  }

  onUserMenuItemClick(action: string) {
    this.closeUserMenu()

    switch (action) {
      case 'login':
        this.router.navigate(['/login'])
        break
      case 'register':
        this.router.navigate(['/register'])
        break
      case 'profile':
        this.router.navigate(['/user/profile'])
        break
      case 'orders':
        this.router.navigate(['/user/orders'])
        break
      case 'purchases':
        this.router.navigate(['/user/purchases'])
        break
      case 'logout':
        // TODO: Implement logout logic
        console.log('Logout clicked')
        break
    }
  }

  loadCategories() {
    this.listingService.getCategories().subscribe({
      next: (data: Document[]) => {
        console.log('Categories loaded in Header:', data);
        
        // A API retorna { key, name, count }. O template espera { key, label, icon }.
        // Vamos transformar os dados para o formato que o template precisa.
        this.categories = data.map(category => ({
          ...category,
          label: category['name'] // Adiciona a propriedade 'label'
        }));
        
        // Define as 'quickCategories' com base nas categorias carregadas
        this.quickCategories = this.categories.slice(0, 11); 
      },
      error: (err: any) => {
        console.error('Failed to load categories in Header', err);
        this.categories = []; // Em caso de erro, define como vazio
        this.quickCategories = [];
      }
    });
  }
  

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode

    if (this.isDarkMode) {
      document.documentElement.classList.add('p-dark')
    } else {
      document.documentElement.classList.remove('p-dark')
    }
  }

  toggleCategoriesMenu(event: Event) {
    this.categoriesPanel.toggle(event)
    this.categoriesMenuVisible = !this.categoriesMenuVisible
  }

  toggleMobileMenu() {
    this.mobileMenuVisible = !this.mobileMenuVisible
    if (this.mobileMenuVisible) {
      this.mobileCategoriesVisible = false
    }
  }

  toggleMobileCategoriesMenu() {
    this.mobileCategoriesVisible = !this.mobileCategoriesVisible
  }

  closeMobileMenu() {
    this.mobileMenuVisible = false
    this.mobileCategoriesVisible = false
  }

  toggleMobileSearch() {
    this.mobileSearchVisible = !this.mobileSearchVisible
    if (this.mobileSearchVisible) {
      this.mobileMenuVisible = false
    }
  }

  closeMobileSearch() {
    this.mobileSearchVisible = false
  }

  onSearch() {
    console.log('🔍 Header search triggered with term:', this.searchTerm)

    if (this.searchTerm.trim()) {
      const searchTerm = this.searchTerm.trim()
      console.log('🚀 Navigating to listing with search term:', searchTerm)

      // Update the search service
      this.searchService.setSearchTerm(searchTerm)

      // Navigate to product list with search term
      this.router
        .navigate(['/listing'], {
          queryParams: { name: searchTerm },
        })
        .then(success => {
          console.log('📍 Navigation success:', success)
        })
        .catch(error => {
          console.error('❌ Navigation error:', error)
        })

      this.closeMobileMenu()
      this.closeMobileSearch()
    } else {
      console.log('⚠️ Search term is empty, not navigating')
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize()

    if (this.isDesktop && this.mobileMenuVisible) {
      this.closeMobileMenu()
    }
  }

  private checkScreenSize() {
    const width = window.innerWidth

    this.isMobile = width < this.MOBILE_BREAKPOINT
    this.isTablet =
      width >= this.MOBILE_BREAKPOINT && width < this.DESKTOP_BREAKPOINT
    this.isDesktop = width >= this.DESKTOP_BREAKPOINT

    if (this.isMobile) {
      this.currentScreenSize = 'mobile'
    } else if (this.isTablet) {
      this.currentScreenSize = 'tablet'
    } else {
      this.currentScreenSize = 'desktop'
    }
  }

  private syncLoginState() {
    this.isLoggedIn = DEVELOPMENT_CONFIG.DEFAULT_USER_ID !== '0'
    if (this.isLoggedIn) {
      this.loadUsername()
    } else {
      this.username = ''
    }
  }

  private loadUsername() {
    const userId = DEVELOPMENT_CONFIG.DEFAULT_USER_ID
    if (userId && userId !== '0') {
      this.userService.getUserById(userId).subscribe({
        next: (user: UserResponse) => {
          this.username = user.fullName || ''
        },
        error: () => {
          this.username = ''
        },
      })
    } else {
      this.username = ''
    }
  }

  // Get categories for current screen size
  getQuickCategoriesForScreen() {
    if (this.isMobile) {
      return [] // No quick categories on mobile
    } else if (this.isTablet) {
      return this.quickCategories.slice(0, 4) // Show 4 categories on tablet
    } else if (
      this.currentScreenSize === 'desktop' &&
      window.innerWidth < 1400
    ) {
      return this.quickCategories.slice(0, 6) // Show 6 categories on smaller desktop
    } else {
      return this.quickCategories // Show all on large desktop
    }
  }

  // Check if quick categories should be visible
  shouldShowQuickCategories(): boolean {
    return !this.isMobile
  }

  // Get responsive label for categories button
  getCategoriesButtonLabel(): string {
    if (this.isMobile) {
      return 'Categorias'
    } else if (this.isTablet) {
      return 'Todas as categorias'
    } else {
      return 'Todas as categorias'
    }
  }

  // Get count of visible categories (for debugging/UI feedback)
  getVisibleCategoriesCount(): number {
    return this.getQuickCategoriesForScreen().length
  }

  // Get non-quick categories for mobile dropdown (excluding quick categories)
  getNonQuickCategories() {
    const quickCategoryKeys = this.quickCategories.map(cat => cat['key'])
    return this.categories.filter(
      category => !quickCategoryKeys.includes(category["key"]),
    )
  }

  // Get brand text based on current route
  getBrandText(): string {
    return this.isDashboardRoute ? 'Mercado Nosso Analytics' : 'Mercado Nosso'
  }

  navigateToCategory(categoryKey: string) {
    this.onCategorySelected(); // This closes the panel
    
    // Navigate programmatically, letting Angular handle the encoding
    this.router.navigate(['/listing'], { 
      queryParams: { category: categoryKey } 
    });
  }
}
