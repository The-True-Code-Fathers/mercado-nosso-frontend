import { Routes } from '@angular/router'

export const editListingRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./index').then(c => c.EditListingComponent),
    title: 'Editar Anúncio - Mercado Nosso',
  },
]
