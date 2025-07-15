import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

export interface Listing {
  listingId: string
  sellerId: string
  sku: string
  productRecommendation: string[]
  title: string
  description: string
  price: number
  rating: number
  reviewsId: string[]
  imagesUrl: string[]
  category: string
  stock: number
  productCondition: 'NEW' | 'USED' | 'REFURBISHED' | 'DAMAGED'
  active?: boolean
  createdAt?: string
}

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  private apiUrl = 'http://localhost:8080/api/listings'

  constructor(private http: HttpClient) {}

  getListingById(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`)
  }

  getAllListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(this.apiUrl)
  }

  createListing(listing: Partial<Listing>): Observable<Listing> {
    return this.http.post<Listing>(this.apiUrl, listing)
  }

  deleteListing(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
