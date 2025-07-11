import { Component, OnInit, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { CommonModule } from '@angular/common'
import { ListingService, Listing } from './services/listing.service'

@Component({
  selector: 'app-listing',
  template: `
    <div class="listing-container">
      <h2>Produtos Disponíveis</h2>

      <div *ngIf="isLoading()" class="loading">Carregando produtos...</div>

      <div *ngIf="error()" class="error">
        {{ error() }}
        <button (click)="loadListings()">Tentar novamente</button>
      </div>

      <div *ngIf="!isLoading() && !error()" class="listings-grid">
        <div *ngFor="let listing of listings()" class="listing-card">
          <h3>{{ listing.title }}</h3>
          <p class="price">R$ {{ listing.price | number : '1.2-2' }}</p>
          <p class="condition">Condição: {{ listing.productCondition }}</p>
          <p class="stock">Estoque: {{ listing.stock }}</p>
          <p class="description">{{ listing.description }}</p>
          <a [routerLink]="['/listing', listing.listingId]" class="view-link">
            Ver detalhes
          </a>
        </div>
      </div>

      <div
        *ngIf="!isLoading() && !error() && listings().length === 0"
        class="empty"
      >
        Nenhum produto encontrado.
      </div>
    </div>
  `,
  styles: [
    `
      .listing-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .listings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
      }

      .listing-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
      }

      .listing-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .listing-card h3 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 1.2rem;
      }

      .price {
        font-size: 1.5rem;
        font-weight: bold;
        color: #00a650;
        margin: 0.5rem 0;
      }

      .condition,
      .stock {
        color: #666;
        margin: 0.5rem 0;
      }

      .description {
        color: #555;
        margin: 1rem 0;
        line-height: 1.4;
      }

      .view-link {
        display: inline-block;
        background: #3483fa;
        color: white;
        padding: 0.75rem 1.5rem;
        text-decoration: none;
        border-radius: 6px;
        transition: background 0.2s;
      }

      .view-link:hover {
        background: #2968c8;
      }

      .loading,
      .error,
      .empty {
        text-align: center;
        padding: 2rem;
        color: #666;
      }

      .error {
        color: #e74c3c;
      }

      .error button {
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        background: #3483fa;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
    `,
  ],
  standalone: true,
  imports: [RouterLink, CommonModule],
})
export class ListingComponent implements OnInit {
  listings = signal<Listing[]>([])
  isLoading = signal<boolean>(false)
  error = signal<string | null>(null)

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.loadListings()
  }

  loadListings(): void {
    this.isLoading.set(true)
    this.error.set(null)

    this.listingService.getAllListings().subscribe({
      next: listings => {
        this.listings.set(listings)
        this.isLoading.set(false)
      },
      error: err => {
        this.error.set('Erro ao carregar produtos')
        this.isLoading.set(false)
        console.error('Erro ao carregar listings:', err)
      },
    })
  }
}
