import { Component, Input, Output, EventEmitter } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { RatingModule } from 'primeng/rating'
import { BadgeModule } from 'primeng/badge'
import { TagModule } from 'primeng/tag'

export interface RecommendationCardData {
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
}

@Component({
  selector: 'app-recommendation-card',
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
  templateUrl: './recommendation-card.component.html',
  styleUrls: ['./recommendation-card.component.scss'],
})
export class RecommendationCardComponent {
  @Input() product!: RecommendationCardData
  @Input() linkPath: string = '/listing'
  @Input() showRating: boolean = true
  @Input() showCondition: boolean = true

  @Output() viewDetails = new EventEmitter<RecommendationCardData>()

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
