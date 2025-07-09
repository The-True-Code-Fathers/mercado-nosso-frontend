import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { DecimalPipe, CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-listing-detail',
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.scss'],
  standalone: true,
  imports: [DecimalPipe, CommonModule, FormsModule],
})
export class ListingDetailComponent {
  productId: string | null = null
  selectedImageIndex = 0
  cep: string = ''
  freteCalculado: boolean = false
  previsaoEntrega: string = ''
  custoFrete: string = ''

  // Propriedades mockadas para exibição inicial
  product = {
    id: 1,
    title: 'Processador Intel Core i5 12400F 12ª Geração',
    price: 999.99,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_2X_825234-MLA51585701313_092022-F.webp',
      'https://http2.mlstatic.com/D_NQ_NP_2X_825234-MLA51585701313_092022-O.webp',
    ],
    description:
      'Processador Intel Core i5 12400F, 12ª Geração, 6 Núcleos, 12 Threads, 2.5GHz (4.4GHz Turbo)',
    rating: 4.8,
    reviews: 120,
    comments: [
      { user: 'João', comment: 'Produto excelente!' },
      { user: 'Maria', comment: 'Chegou rápido e bem embalado.' },
    ],
    condition: 'Novo', // ou 'Usado'
    sold: 320,
    shipping: 'Frete grátis para todo o Brasil',
    deliveryEstimate: 'Receba até 15 de Julho',
    installments: '12x de R$ 83,33 sem juros',
    seller: {
      name: 'Loja Oficial Intel',
      reputation: 'Ótima',
      sales: 1500,
    },
    stock: 8,
  }

  constructor(private route: ActivatedRoute) {
    this.productId = this.route.snapshot.paramMap.get('id')
    // Aqui você pode futuramente buscar o produto pelo id
  }

  selectImage(index: number) {
    this.selectedImageIndex = index
  }

  calcularFrete() {
    // Simulação de cálculo de frete
    this.freteCalculado = true
    this.custoFrete = 'R$ 25,00'
    this.previsaoEntrega = 'Receba até 18 de Julho'
  }

  get starsArray() {
    return Array(5).fill(0)
  }
  get filledStars() {
    return Math.round(this.product.rating)
  }
}
