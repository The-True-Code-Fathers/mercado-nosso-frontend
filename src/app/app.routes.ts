import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';


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
    path: 'finish',
    loadComponent: () =>
      import('./features/finish/finish.component').then((m) => m.FinishComponent),
  },
  {
    path: 'listing',
    loadChildren: () =>
      import('./features/listing/listing.routes').then(m => m.listingRoutes),
    title: 'Anúncios',
  },
  {
    path: 'login',
    loadChildren: () => 
      import('./features/login/login.routes').then(m => m.loginRoutes),
    title: 'Login',
  },
  {
    path: 'checkout',
    loadChildren: () => 
      import('./features/checkout/checkout.routes').then(m => m.checkoutRoutes),
    title: 'Checkout',
  }
];