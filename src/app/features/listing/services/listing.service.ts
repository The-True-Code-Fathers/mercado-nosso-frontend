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
  productCondition: 'NEW' | 'USED'
  salesCount?: number
  active?: boolean
  createdAt?: string
}

export interface Review {
  id: string
  listingId: string
  buyerId: string
  rating: number
  message: string
  imagesUrls: string[]
  createdAt: string
  sellerId: string
}

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  private apiUrl = 'http://localhost:8080/api/listings'
  private reviewsApiUrl = 'http://localhost:8080/api/reviews'

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

  getReviewsByListingId(listingId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.reviewsApiUrl}/listing/${listingId}`)
  }

  updateListing(listing: Listing): Observable<Listing> {
    return this.http.put<Listing>(
      `${this.apiUrl}/${listing.listingId}`,
      listing,
    )
  }
}
