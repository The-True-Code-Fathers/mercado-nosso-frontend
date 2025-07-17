import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { DEVELOPMENT_CONFIG } from '../../../shared/config/development.config'

export interface Order {
  orderId: string
  buyerId: string
  listingID: string[]
  status: 'OPEN' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  creationTime: string
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = `${DEVELOPMENT_CONFIG.API_BASE_URL}/api/orders`

  constructor(private http: HttpClient) {}

  getAllOrdersByBuyer(buyerId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/all/${buyerId}`)
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`)
  }
}
