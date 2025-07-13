import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { DEVELOPMENT_CONFIG } from '../../../shared/config/development.config'

export interface CartItemResponse {
  listingId: string
  quantity: number
  price: number
  shippingPrice: number
}

export interface CartResponse {
  id: string
  userId: string
  subTotal: number
  shippingPriceTotal: number
  grandTotal: number
  items: CartItemResponse[]
}

export interface AddItemRequest {
  listingId: string
  quantity: number
}

export interface UpdateItemQuantityRequest {
  listingId: string
  quantity: number
}

export interface RemoveListingRequest {
  listingsIds: string[]
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${DEVELOPMENT_CONFIG.API_BASE_URL}${DEVELOPMENT_CONFIG.API_ENDPOINTS.CARTS}`
  
  // User ID fixo para desenvolvimento - mova para AuthService quando implementar autenticação
  private readonly userId = DEVELOPMENT_CONFIG.DEFAULT_USER_ID

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-User-Id': this.userId,
      'Content-Type': 'application/json'
    })
  }

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.apiUrl, { 
      headers: this.getHeaders() 
    })
  }

  addItemToCart(listingId: string, quantity: number): Observable<CartResponse> {
    const request: AddItemRequest = { listingId, quantity }
    return this.http.post<CartResponse>(`${this.apiUrl}/items`, request, { 
      headers: this.getHeaders() 
    })
  }

  updateItemQuantity(listingId: string, quantity: number): Observable<CartResponse> {
    const request: UpdateItemQuantityRequest = { listingId, quantity }
    return this.http.put<CartResponse>(`${this.apiUrl}/items`, request, { 
      headers: this.getHeaders() 
    })
  }

  removeItemFromCart(listingIds: string[]): Observable<void> {
    const request: RemoveListingRequest = { listingsIds: listingIds }
    return this.http.delete<void>(`${this.apiUrl}/remove`, { 
      headers: this.getHeaders(),
      body: request
    })
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl, { 
      headers: this.getHeaders() 
    })
  }
}
