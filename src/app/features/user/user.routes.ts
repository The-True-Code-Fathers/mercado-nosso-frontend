import { Routes } from '@angular/router'

export const userRoutes: Routes = [
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full',
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/user-profile/user-profile.component').then(
        m => m.UserProfileComponent,
      ),
    title: 'Minha Conta - Mercado Nosso',
  },
  {
    path: 'my-listings',
    loadComponent: () =>
      import('./pages/my-listings/my-listings.component').then(
        m => m.MyListingsComponent,
      ),
    title: 'Meus Anúncios - Mercado Nosso',
  },
  {
    path: 'my-purchases',
    loadComponent: () =>
      import('./pages/my-purchases/my-purchases.component').then(
        m => m.MyPurchasesComponent,
      ),
    title: 'Minhas Compras - Mercado Nosso',
  },
]
