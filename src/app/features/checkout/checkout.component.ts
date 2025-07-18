import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { MessageService } from 'primeng/api'
import { ToastModule } from 'primeng/toast'
import { forkJoin, of, catchError } from 'rxjs'
import { CheckoutService } from './services/checkout.service'
import {
  CartService,
  CartResponse,
  CartItemResponse,
} from '../cart/services/cart.service'
import { ListingService, Listing } from '../listing/services/listing.service'
import { UserService, UserResponse } from '../user/services/user.service'
import { CheckoutStepsComponent } from './components/checkout-steps/checkout-steps.component'
import { OrderSummaryComponent } from './components/order-summary/order-summary.component'
import { CartReviewStepComponent } from './components/cart-review-step/cart-review-step.component'
import { ShippingStepComponent } from './components/shipping-step/shipping-step.component'
import { PaymentStepComponent } from './components/payment-step/payment-step.component'
import { ConfirmationStepComponent } from './components/confirmation-step/confirmation-step.component'

// Import CheckoutItem from the service models
import { CheckoutItem } from './models/checkout.models'

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    CheckoutStepsComponent,
    OrderSummaryComponent,
    CartReviewStepComponent,
    ShippingStepComponent,
    PaymentStepComponent,
    ConfirmationStepComponent,
  ],
  providers: [MessageService],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private checkoutService = inject(CheckoutService)
  private cartService = inject(CartService)
  private listingService = inject(ListingService)
  private userService = inject(UserService)
  private messageService = inject(MessageService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  // Signal getters for reactive UI
  currentStep = this.checkoutService.currentStep
  steps = this.checkoutService.steps
  orderSummary = this.checkoutService.orderSummary
  isLoading = this.checkoutService.isLoading

  ngOnInit(): void {
    this.initializeCheckout()
  }

  private initializeCheckout(): void {
    // Check navigation state to determine checkout source
    const navigation = this.router.getCurrentNavigation()
    const state = navigation?.extras?.state || history.state

    if (state?.source === 'cart' && state?.selectedCartItems) {
      // Scenario 1: User came from cart with selected items
      this.initializeFromCartItems(state.selectedCartItems)
    } else if (state?.source === 'buyNow' && state?.directBuyItem) {
      // Scenario 2: User came from "Buy Now" button
      this.initializeFromDirectBuy(state.directBuyItem)
    } else {
      // Fallback: User navigated directly to checkout URL
      this.handleDirectNavigation()
    }
  }

  private initializeFromCartItems(selectedCartItems: any[]): void {
    console.log('Initializing checkout from cart items:', selectedCartItems)

    // Convert cart items to checkout items and fetch additional data
    this.enrichCartItemsForCheckout(selectedCartItems)
  }

  private initializeFromDirectBuy(directBuyItem: any): void {
    console.log('Initializing checkout from direct buy:', directBuyItem)

    // Item is already in checkout format, but we need to fetch seller info
    this.enrichSingleItemForCheckout(directBuyItem)
  }

  private handleDirectNavigation(): void {
    // User navigated directly to checkout URL without proper state
    this.messageService.add({
      severity: 'warn',
      summary: 'Carrinho Vazio',
      detail: 'Adicione produtos ao carrinho antes de finalizar a compra',
      life: 5000,
    })
    this.router.navigate(['/cart'])
  }

  private isValidSellerId(sellerId: any): boolean {
    console.log('🔍 Validating seller ID:', sellerId, 'Type:', typeof sellerId)

    if (!sellerId) {
      console.log('❌ Seller ID is falsy')
      return false
    }
    if (typeof sellerId !== 'string') {
      console.log('❌ Seller ID is not a string')
      return false
    }
    if (sellerId.trim() === '') {
      console.log('❌ Seller ID is empty string')
      return false
    }
    if (sellerId === 'unknown') {
      console.log('❌ Seller ID is "unknown"')
      return false
    }
    if (sellerId === 'null') {
      console.log('❌ Seller ID is "null"')
      return false
    }
    if (sellerId === 'undefined') {
      console.log('❌ Seller ID is "undefined"')
      return false
    }

    // Check if it looks like a valid UUID or ID format
    const trimmedId = sellerId.trim()
    if (trimmedId.length < 3) {
      console.log('❌ Seller ID too short:', trimmedId.length)
      return false
    }

    console.log('✅ Seller ID is valid:', trimmedId)
    return true
  }

  private enrichSingleItemForCheckout(item: any): void {
    console.log('Processing item for checkout:', item)
    console.log('Seller ID:', item.sellerId)

    // Check if we have a valid seller ID before making the API call
    if (!this.isValidSellerId(item.sellerId)) {
      // Use fallback seller name and proceed with checkout
      const enrichedItem = {
        ...item,
        sellerName: item.sellerName || 'Vendedor Desconhecido',
      }

      console.log('Using fallback seller name (invalid ID):', enrichedItem)
      this.checkoutService.initializeCheckout([enrichedItem])
      return
    }

    console.log('Making API call to fetch seller info for ID:', item.sellerId)
    console.log(
      'API URL will be:',
      `http://localhost:8080/api/users/${item.sellerId}`,
    )

    this.userService.getUserById(item.sellerId).subscribe({
      next: seller => {
        console.log('✅ API call successful, received seller data:', seller)
        const enrichedItem = {
          ...item,
          sellerName: seller.fullName || `Vendedor ${item.sellerId}`,
        }

        console.log(
          'Successfully enriched item with seller info:',
          enrichedItem,
        )
        this.checkoutService.initializeCheckout([enrichedItem])
      },
      error: error => {
        console.error('❌ HttpErrorResponse details:')
        console.error('- Status:', error.status)
        console.error('- Status Text:', error.statusText)
        console.error('- URL:', error.url)
        console.error('- Error message:', error.message)
        console.error('- Full error object:', error)

        // Continue with original seller name as fallback
        const fallbackItem = {
          ...item,
          sellerName:
            item.sellerName || `Vendedor ${item.sellerId || 'Desconhecido'}`,
        }
        console.log('Using fallback after API error:', fallbackItem)
        this.checkoutService.initializeCheckout([fallbackItem])
      },
    })
  }

  private enrichCartItemsForCheckout(cartItems: any[]): void {
    // We need to fetch listing details and seller info for cart items
    const listingRequests = cartItems.map(item =>
      this.listingService.getListingById(item.listingId).pipe(
        catchError(error => {
          console.error(`Error fetching listing ${item.listingId}:`, error)
          return of({
            listingId: item.listingId,
            sellerId: 'unknown',
            title: item.name || `Produto ${item.listingId}`,
            price: item.unitPrice || 0,
            imagesUrl: [
              item.image || 'https://via.placeholder.com/80x80?text=📦',
            ],
          })
        }),
      ),
    )

    forkJoin(listingRequests).subscribe({
      next: (listings: any[]) => {
        // Create requests to fetch seller information using the new validation method
        const sellerRequests = listings.map(listing => {
          const sellerId = listing.sellerId

          console.log(
            'Processing seller ID for listing:',
            listing.listingId,
            'Seller ID:',
            sellerId,
          )

          // Use the unified validation method
          if (!this.isValidSellerId(sellerId)) {
            console.log('Using fallback for invalid seller ID:', sellerId)
            return of({
              id: sellerId || 'unknown',
              fullName: 'Vendedor Desconhecido',
            })
          }

          console.log('Making API call for seller ID:', sellerId)
          console.log(
            'API URL will be:',
            `http://localhost:8080/api/users/${sellerId}`,
          )

          return this.userService.getUserById(sellerId).pipe(
            catchError(error => {
              console.error('❌ HttpErrorResponse in cart flow:')
              console.error('- Seller ID:', sellerId)
              console.error('- Status:', error.status)
              console.error('- Status Text:', error.statusText)
              console.error('- URL:', error.url)
              console.error('- Error message:', error.message)
              console.error('- Full error object:', error)

              return of({
                id: sellerId,
                fullName: `Vendedor ${sellerId}`,
              })
            }),
          )
        })

        forkJoin(sellerRequests).subscribe({
          next: (sellers: any[]) => {
            const checkoutItems = cartItems.map((cartItem, index) => {
              const listing = listings[index]
              const seller = sellers[index]

              return {
                listingId: cartItem.listingId,
                name:
                  listing.title ||
                  cartItem.name ||
                  `Produto ${cartItem.listingId}`,
                unitPrice: cartItem.unitPrice || listing.price || 0,
                quantity: cartItem.quantity || 1,
                totalPrice:
                  cartItem.price || cartItem.unitPrice * cartItem.quantity || 0,
                image:
                  listing.imagesUrl?.[0] ||
                  cartItem.image ||
                  'https://via.placeholder.com/80x80?text=📦',
                sellerId: listing.sellerId || 'unknown',
                sellerName:
                  seller.fullName ||
                  `Vendedor ${listing.sellerId || 'Desconhecido'}`,
                shippingPrice: cartItem.shippingPrice || 0,
              }
            })

            console.log('Enriched cart items for checkout:', checkoutItems)
            this.checkoutService.initializeCheckout(checkoutItems)
          },
          error: error => {
            console.error('Error fetching seller information:', error)
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível carregar as informações dos vendedores',
              life: 5000,
            })
            this.router.navigate(['/cart'])
          },
        })
      },
      error: error => {
        console.error('Error fetching listing details:', error)
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os detalhes dos produtos',
          life: 5000,
        })
        this.router.navigate(['/cart'])
      },
    })
  }

}
