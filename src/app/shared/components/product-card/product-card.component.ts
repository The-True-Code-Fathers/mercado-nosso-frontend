import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { RatingModule } from 'primeng/rating'
import { BadgeModule } from 'primeng/badge'
import { TagModule } from 'primeng/tag'

export interface ProductCardData {
  id: string
  title: string
  price: number
  originalPrice?: number
  image?: string
  rating?: number
  reviews?: number
  condition?: string
  stock?: number
  category?: string
  installments?: string
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CardModule,
    ButtonModule,
    RatingModule,
    BadgeModule,
    TagModule,
  ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  @Input() product!: ProductCardData
  @Input() linkPath: string = '/listing'
  @Input() showAddToCart: boolean = true
  @Input() showRating: boolean = true
  @Input() showCondition: boolean = true
  @Input() showStock: boolean = true

  @Output() addToCart = new EventEmitter<ProductCardData>()
  @Output() viewDetails = new EventEmitter<ProductCardData>()

  onAddToCart(event: Event): void {
    event.preventDefault()
    event.stopPropagation()
    this.addToCart.emit(this.product)
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.product)
  }

  getImageUrl(): string {
    return this.product.image || '/images/placeholder.png'
  }

  getConditionSeverity(): string {
    switch (this.product.condition?.toLowerCase()) {
      case 'new':
      case 'novo':
        return 'success'
      case 'used':
      case 'usado':
        return 'warning'
      case 'refurbished':
      case 'recondicionado':
        return 'info'
      default:
        return 'secondary'
    }
  }

  isLowStock(): boolean {
    return (this.product.stock || 0) < 5
  }

  hasDiscount(): boolean {
    return !!(
      this.product.originalPrice &&
      this.product.originalPrice > this.product.price
    )
  }

  getDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0
    const discount =
      ((this.product.originalPrice! - this.product.price) /
        this.product.originalPrice!) *
      100
    return Math.round(discount)
  }
}
