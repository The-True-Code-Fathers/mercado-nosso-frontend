import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, forkJoin } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
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
  private readonly apiUrl = `${DEVELOPMENT_CONFIG.API_BASE_URL}/api/reviews`
  private submittedReviews = new Set<string>() // Cache local para reviews já enviadas

  constructor(private http: HttpClient) {}

  private getReviewKey(listingId: string, buyerId: string): string {
    return `${listingId}-${buyerId}`
  }

  hasSubmittedReview(listingId: string, buyerId: string): boolean {
    return this.submittedReviews.has(this.getReviewKey(listingId, buyerId))
  }

  markReviewAsSubmitted(listingId: string, buyerId: string): void {
    this.submittedReviews.add(this.getReviewKey(listingId, buyerId))
  }

  clearCache(): void {
    this.submittedReviews.clear()
  }

  removeFromCache(listingId: string, buyerId: string): void {
    this.submittedReviews.delete(this.getReviewKey(listingId, buyerId))
  }

  createReview(review: CreateReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(this.apiUrl, review).pipe(
      map(response => {
        // Marcar como submetida após sucesso
        this.markReviewAsSubmitted(review.listingId, review.buyerId)
        return response
      }),
    )
  }

  getReviewsByListing(listingId: string): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(
      `${this.apiUrl}/listing/${listingId}`,
    )
  }

  getUserReviewForListing(
    listingId: string,
    buyerId: string,
  ): Observable<ReviewResponse | null> {
    // Verificar primeiro o cache local
    if (this.hasSubmittedReview(listingId, buyerId)) {
      return of({
        id: 'local-cache',
        listingId,
        buyerId,
        rating: 0,
        message: 'Avaliação já submetida nesta sessão',
        createdAt: new Date().toISOString(),
        sellerId: '',
        imagesUrls: [],
      })
    }

    // Buscar no servidor
    return this.getReviewsByListing(listingId).pipe(
      map((reviews: ReviewResponse[]) => {
        const userReview = reviews.find(
          (review: ReviewResponse) => review.buyerId === buyerId,
        )
        if (userReview) {
          // Se encontrar no servidor, marcar no cache local também
          this.markReviewAsSubmitted(listingId, buyerId)
        }
        return userReview || null
      }),
      catchError((error: any) => {
        console.error('Erro ao buscar avaliações:', error)
        return of(null)
      }),
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

  // Verifica avaliações para múltiplos listings de uma vez
  checkUserReviewsForListings(
    listingIds: string[],
    buyerId: string,
  ): Observable<{ [listingId: string]: ReviewResponse }> {
    const reviewChecks = listingIds.map(listingId =>
      this.getReviewsByListing(listingId).pipe(
        map(reviews => ({
          listingId,
          review: reviews.find(review => review.buyerId === buyerId) || null,
        })),
        catchError(() => of({ listingId, review: null })),
      ),
    )

    return forkJoin(reviewChecks).pipe(
      map(
        (
          results: Array<{ listingId: string; review: ReviewResponse | null }>,
        ) => {
          const reviewMap: { [listingId: string]: ReviewResponse } = {}
          results.forEach(({ listingId, review }) => {
            if (review) {
              reviewMap[listingId] = review
              // Marcar no cache local também
              this.markReviewAsSubmitted(listingId, buyerId)
            }
          })
          return reviewMap
        },
      ),
    )
  }
}
