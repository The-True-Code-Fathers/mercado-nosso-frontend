import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { CardModule } from 'primeng/card'

export interface ProductCardNewData {
  id: string
  title: string
  price: number
  originalPrice?: number
  image?: string
  rating?: number
  reviews?: number
  installments?: string
}

@Component({
  selector: 'app-product-card-new',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule],
  templateUrl: './product-card-new.component.html',
  styleUrls: ['./product-card-new.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductCardNewComponent {
  @Input() product!: ProductCardNewData
  @Input() linkPath: string = '/listing'

  @Output() cardClick = new EventEmitter<ProductCardNewData>()

  onCardClick(): void {
    this.cardClick.emit(this.product)
  }

  getImageUrl(): string {
    return this.product.image || '/images/placeholder.png'
  }

  getStarsArray(): number[] {
    return Array(5).fill(0)
  }

  mathFloor(value: number): number {
    return Math.floor(value || 0)
  }

  mathCeil(value: number): number {
    return Math.ceil(value || 0)
  }
}
