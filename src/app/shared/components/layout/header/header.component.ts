import { Component, ViewChild } from '@angular/core';
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
export class HeaderComponent {
  @ViewChild('categoriesPanel') categoriesPanel!: OverlayPanel;

  isDarkMode = false;
  searchTerm: string = '';
  categoriesMenuVisible = false;
  mobileMenuVisible = false;
  mobileCategoriesVisible = false;

  constructor(private router: Router) {}

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
  ];

  quickCategories = [
    { key: 'electronics', label: 'Eletrônicos' },
    { key: 'clothing', label: 'Moda' },
    { key: 'home', label: 'Casa' },
    { key: 'sports', label: 'Esportes' },
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
