import { Routes } from '@angular/router';

export const cartRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./listing.component').then((m) => m.ListingComponent),
    title: 'Listing - Mercado Nosso',
  },
];
