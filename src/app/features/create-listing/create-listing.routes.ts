import { Routes } from '@angular/router'
import { CreateListingComponent } from './create-listing.component'

export const createListingRoutes: Routes = [
  {
    path: '',
    component: CreateListingComponent,
    title: 'Criar Anúncio - Mercado Nosso',
  },
]
