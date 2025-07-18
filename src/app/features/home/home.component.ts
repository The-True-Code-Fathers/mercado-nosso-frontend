import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Router } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { ProductCardNewComponent } from '../../shared/components/product-card-new/product-card-new.component'
import { InputTextModule } from 'primeng/inputtext'
import { BadgeModule } from 'primeng/badge'
import { RatingModule } from 'primeng/rating'
import { CarouselModule } from 'primeng/carousel'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ProductCardNewComponent,
    InputTextModule,
    BadgeModule,
    RatingModule,
    CarouselModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  searchTerm: string = ''

  heroSlides = [
    {
      id: 1,
      image: '/images/banner-lg.jpg',
      title: 'Compre e venda com segurança',
      subtitle: 'Milhares de produtos esperando por você no Mercado Nosso',
      buttonText: 'Explorar Produtos',
      buttonLink: '/products',
    },
  ]

  constructor(private router: Router) {}

  ngOnInit() {
    // Inicialização se necessária
  }

  categories = [
    {
      key: 'electronics',
      name: 'Eletrônicos',
      description: 'Celulares, notebooks, TVs',
      icon: 'pi pi-desktop',
      count: '2.5k+',
    },
    {
      key: 'clothing',
      name: 'Roupas e Calçados',
      description: 'Moda masculina e feminina',
      icon: 'pi pi-user',
      count: '1.8k+',
    },
    {
      key: 'home',
      name: 'Casa e Jardim',
      description: 'Móveis, decoração, ferramentas',
      icon: 'pi pi-home',
      count: '3.2k+',
    },
    {
      key: 'sports',
      name: 'Esportes',
      description: 'Equipamentos e acessórios',
      icon: 'pi pi-star',
      count: '950+',
    },
    {
      key: 'books',
      name: 'Livros',
      description: 'Literatura, técnicos, didáticos',
      icon: 'pi pi-book',
      count: '1.2k+',
    },
    {
      key: 'beauty',
      name: 'Beleza',
      description: 'Cosméticos, perfumes, cuidados',
      icon: 'pi pi-heart',
      count: '780+',
    },
  ]

  featuredProducts = [
    {
      id: 1,
      name: 'Smartphone Samsung Galaxy A54',
      price: 1299.99,
      image: 'https://via.placeholder.com/300x200?text=Samsung+Galaxy+A54',
      rating: 4.5,
      reviews: 128,
    },
    {
      id: 2,
      name: 'Notebook Dell Inspiron 15',
      price: 2499.99,
      image: 'https://via.placeholder.com/300x200?text=Dell+Inspiron+15',
      rating: 4.2,
      reviews: 89,
    },
    {
      id: 3,
      name: 'Smart TV LG 55" 4K',
      price: 1899.99,
      image: 'https://via.placeholder.com/300x200?text=LG+Smart+TV+55',
      rating: 4.7,
      reviews: 203,
    },
    {
      id: 4,
      name: 'Fone Bluetooth JBL Tune 510BT',
      price: 199.99,
      image: 'https://via.placeholder.com/300x200?text=JBL+Tune+510BT',
      rating: 4.3,
      reviews: 156,
    },
  ]

  onHeroSearch() {
    if (this.searchTerm.trim()) {
      // Navegar para página de produtos com termo de busca
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchTerm },
      })
    }
  }
}
