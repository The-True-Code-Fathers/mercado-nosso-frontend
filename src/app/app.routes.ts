import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./features/product/product.routes').then(m => m.productRoutes),
    title: 'Produtos',
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./features/cart/cart.routes').then(m => m.cartRoutes),
    title: 'Carrinho',
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./features/user/user.routes').then(m => m.userRoutes),
    title: 'Usuário',
  },
  {
    path: 'listing',
    loadChildren: () =>
      import('./features/listing/listing.routes').then(m => m.listingRoutes),
    title: 'Anúncios',
  },
]
