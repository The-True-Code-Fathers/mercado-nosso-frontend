import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { DEVELOPMENT_CONFIG } from '../../../shared/config/development.config'

export interface CreateReviewRequest {
  listingId: string
  buyerId: string
  rating: number
  message?: string
  imagesUrls?: string[]
}

export interface ReviewResponse {
  id: string
  listingId: string
  buyerId: string
  rating: number
  message?: string
  imagesUrls?: string[]
  createdAt: string
  sellerId: string
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly apiUrl = `${DEVELOPMENT_CONFIG.API_BASE_URL}/reviews`

  constructor(private http: HttpClient) {}

  createReview(review: CreateReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(this.apiUrl, review)
  }

  getReviewsByListing(listingId: string): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(
      `${this.apiUrl}/listing/${listingId}`,
    )
  }

  updateReview(
    id: string,
    review: Partial<CreateReviewRequest>,
  ): Observable<ReviewResponse> {
    return this.http.put<ReviewResponse>(`${this.apiUrl}/${id}`, review)
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
