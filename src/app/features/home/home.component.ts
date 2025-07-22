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

import { Document } from 'bson'
import {
  ListingService,
  Listing,
  PagedListingResponse,
} from '../listing/services/listing.service'

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

  // 👈 FIX: Usar o tipo 'Document' para o array de categorias
  categories: Document[] = []
  // 👈 FIX: Usar o tipo 'Listing' para os produtos
  featuredProducts: Listing[] = []

  heroSlides = [
    { image: '/images/rawsj.jpg' },
    { image: '/images/raw.jpg' },
    { image: '/images/banner-lg.jpg' },
  ]

  // A injeção de dependência agora funciona porque o ListingService foi importado
  constructor(private router: Router, private listingService: ListingService) {}

  ngOnInit() {
    this.loadCategories()
    this.loadFeaturedProducts()
  }

  loadCategories() {
    this.listingService.getCategories().subscribe({
      // 👈 FIX: Adicionar o tipo para 'data'
      next: (data: Document[]) => {
        this.categories = data
      },
      // 👈 FIX: Adicionar o tipo para 'err'
      error: (err: any) => console.error('Erro ao carregar categorias:', err),
    })
  }

  loadFeaturedProducts() {
    this.listingService.getFeaturedListings(8).subscribe({
      // 👈 FIX: Adicionar o tipo para 'pagedResponse'
      next: (pagedResponse: PagedListingResponse) => {
        this.featuredProducts = pagedResponse.content
      },
      // 👈 FIX: Adicionar o tipo para 'err'
      error: (err: any) =>
        console.error('Erro ao carregar produtos em destaque:', err),
    })
  }

  onHeroSearch() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/listings'], {
        queryParams: { name: this.searchTerm },
      })
    }
  }
}
