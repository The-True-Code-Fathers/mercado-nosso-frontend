import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { OverlayPanel } from 'primeng/overlaypanel';
// import { CartService } from '../../core/services/cart.service'; // Uncomment when cart service is implemented

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
  @ViewChild('categoriesPanel') categoriesPanel!: OverlayPanel;

  isDarkMode = false;
  searchTerm: string = '';
  categoriesMenuVisible = false;
  mobileMenuVisible = false;
  mobileCategoriesVisible = false;
  categoriesMegaMenuVisible = false;
  cartItemsCount = 3; // TODO: This should come from CartService
  username: string | null = 'Matheus'; // TODO: Replace with actual user service
  megaMenuItems: any[] = [];
  constructor(
    private router: Router // private cartService: CartService // Inject when available
  ) {}

  ngOnInit() {
    this.setupMegaMenuItems();
    // TODO: Subscribe to cart service to get real-time cart count
    // this.cartService.cartItems$.subscribe(items => {
    //   this.cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);
    // });
  }

  ngOnDestroy() {
    // TODO: Unsubscribe from cart service
  }

  setupMegaMenuItems() {
    // Cria um array simples de itens de menu para o mega menu
    const menuItems = this.categories.map((category) => ({
      label: category.label,
      icon: category.icon,
      routerLink: ['/products'],
      queryParams: { category: category.key },
      command: () => {
        this.categoriesMegaMenuVisible = false;
      },
    }));

    // Organiza em colunas para melhor visualização
    const itemsPerColumn = Math.ceil(menuItems.length / 3);
    const columns = [];

    for (let i = 0; i < menuItems.length; i += itemsPerColumn) {
      columns.push(menuItems.slice(i, i + itemsPerColumn));
    }

    this.megaMenuItems = [
      {
        label: 'Categorias',
        items: [columns],
      },
    ];
  }

  toggleCategoriesMegaMenu() {
    this.categoriesMegaMenuVisible = !this.categoriesMegaMenuVisible;
  }

  closeCategoriesMegaMenu() {
    this.categoriesMegaMenuVisible = false;
  }

  onCategorySelected() {
    this.categoriesMegaMenuVisible = false;
  }

  categories = [
    { key: 'electronics', label: 'Eletrônicos', icon: 'pi pi-desktop' },
    { key: 'clothing', label: 'Roupas e Acessórios', icon: 'pi pi-user' },
    { key: 'home', label: 'Casa e Jardim', icon: 'pi pi-home' },
    { key: 'books', label: 'Livros e Mídia', icon: 'pi pi-book' },
    { key: 'sports', label: 'Esportes e Lazer', icon: 'pi pi-star' },
    { key: 'toys', label: 'Brinquedos', icon: 'pi pi-heart' },
    { key: 'health', label: 'Saúde e Beleza', icon: 'pi pi-heart' },
    { key: 'auto', label: 'Automotivo', icon: 'pi pi-car' },
    { key: 'food', label: 'Alimentos e Bebidas', icon: 'pi pi-shopping-cart' },
    { key: 'pets', label: 'Pets', icon: 'pi pi-heart' },
    { key: 'stationery', label: 'Papelaria', icon: 'pi pi-pencil' },
    { key: 'music', label: 'Instrumentos Musicais', icon: 'pi pi-music' },
    { key: 'games', label: 'Games', icon: 'pi pi-gamepad' },
    { key: 'baby', label: 'Bebês', icon: 'pi pi-baby' },
    { key: 'tools', label: 'Ferramentas', icon: 'pi pi-wrench' },
    { key: 'jewelry', label: 'Joias e Relógios', icon: 'pi pi-gem' },
    { key: 'office', label: 'Escritório', icon: 'pi pi-briefcase' },
    { key: 'garden', label: 'Jardinagem', icon: 'pi pi-leaf' },
    { key: 'travel', label: 'Viagem', icon: 'pi pi-send' },
    { key: 'services', label: 'Serviços', icon: 'pi pi-cog' },
  ];

  quickCategories = [
    { key: 'electronics', label: 'Eletrônicos', icon: 'pi pi-desktop' },
    { key: 'clothing', label: 'Roupas e Acessórios', icon: 'pi pi-user' },
    { key: 'home', label: 'Casa e Jardim', icon: 'pi pi-home' },
    { key: 'books', label: 'Livros e Mídia', icon: 'pi pi-book' },
    { key: 'sports', label: 'Esportes e Lazer', icon: 'pi pi-star' },
    { key: 'toys', label: 'Brinquedos', icon: 'pi pi-heart' },
    { key: 'health', label: 'Saúde e Beleza', icon: 'pi pi-heart' },
    { key: 'auto', label: 'Automotivo', icon: 'pi pi-car' },
    { key: 'food', label: 'Alimentos e Bebidas', icon: 'pi pi-shopping-cart' },
    { key: 'pets', label: 'Pets', icon: 'pi pi-heart' },
    { key: 'stationery', label: 'Papelaria', icon: 'pi pi-pencil' },
  ];

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.documentElement.classList.add('p-dark');
    } else {
      document.documentElement.classList.remove('p-dark');
    }
  }

  toggleCategoriesMenu(event: Event) {
    this.categoriesPanel.toggle(event);
    this.categoriesMenuVisible = !this.categoriesMenuVisible;
  }

  toggleMobileMenu() {
    this.mobileMenuVisible = !this.mobileMenuVisible;
    if (this.mobileMenuVisible) {
      this.mobileCategoriesVisible = false;
    }
  }

  toggleMobileCategoriesMenu() {
    this.mobileCategoriesVisible = !this.mobileCategoriesVisible;
  }

  closeMobileMenu() {
    this.mobileMenuVisible = false;
    this.mobileCategoriesVisible = false;
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      // Navigate to product list with search term
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchTerm.trim() },
      });
      this.closeMobileMenu();
    }
  }
}
