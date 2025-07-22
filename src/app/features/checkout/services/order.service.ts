import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { CreateOrderRequest, CreateOrderResponse } from '../models/api.models'

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:8080/api/orders'

  constructor(private http: HttpClient) {}

  createOrder(
    orderRequest: CreateOrderRequest,
  ): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.apiUrl, orderRequest)
  }
}
