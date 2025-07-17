import { Routes } from '@angular/router'
import { LoginComponent } from './features/login/login.component'

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
    redirectTo: '/listing',
    pathMatch: 'full',
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
  {
    path: 'create-listing',
    loadChildren: () =>
      import('./features/create-listing/create-listing.routes').then(
        m => m.createListingRoutes,
      ),
    title: 'Criar Anúncio',
  },
  {
    path: 'edit-listing/:id',
    loadChildren: () =>
      import('./features/edit-listing/edit-listing.routes').then(
        m => m.editListingRoutes,
      ),
    title: 'Editar Anúncio',
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
  },
  {
    path: 'edit-profile',
    loadChildren: () =>
      import('./features/edit-profile/edit-profile.routes').then(
        m => m.editProfileRoutes,
      ),
    title: 'Editar Perfil',
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./features/create-account/create-account.routes').then(
        m => m.createAccountRoutes,
      ),
    title: 'Criar conta',
  },
  {
    path: 'sellerRegister',
    loadChildren: () =>
      import('./features/be-a-seller/be-a-seller.routes').then(
        m => m.createAccountRoutes,
      ),
    title: 'Seja um vendedor',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        m => m.DashboardComponent,
      ),
    title: 'Dashboard',
  },
]
