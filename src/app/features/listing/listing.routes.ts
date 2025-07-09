import { Routes } from '@angular/router'

export const listingRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./listing.component').then(m => m.ListingComponent),
    title: 'Listing - Mercado Nosso',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/listing-detail/listing-detail.component').then(
        m => m.ListingDetailComponent,
      ),
    title: 'Detalhe do Produto - Mercado Nosso',
  },
]
