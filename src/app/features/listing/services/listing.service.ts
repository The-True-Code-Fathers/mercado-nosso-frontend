import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { throwError } from 'rxjs'

export interface Listing {
  listingId: string
  title: string
  description: string
  price: number
  stock: number
  active: boolean
  productCondition: string
  createdAt: string
}

export interface PagedListingResponse {
  content: Listing[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  empty: boolean
}

export interface SearchParams {
  name?: string
  ordering?:
    | 'PRICE_ASC'
    | 'PRICE_DESC'
    | 'NAME_ASC'
    | 'NAME_DESC'
    | 'CREATED_AT_ASC'
    | 'CREATED_AT_DESC'
  condition?: 'NEW' | 'USED'
  minPrice?: number
  maxPrice?: number
  page?: number
  size?: number
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

  searchListingsPaginated(
    params: SearchParams,
  ): Observable<PagedListingResponse> {
    let httpParams = new HttpParams()

    if (params.name) httpParams = httpParams.set('name', params.name)
    if (params.ordering)
      httpParams = httpParams.set('ordering', params.ordering)
    if (params.condition)
      httpParams = httpParams.set('condition', params.condition)
    if (params.minPrice !== undefined)
      httpParams = httpParams.set('minPrice', params.minPrice.toString())
    if (params.maxPrice !== undefined)
      httpParams = httpParams.set('maxPrice', params.maxPrice.toString())
    if (params.page !== undefined)
      httpParams = httpParams.set('page', params.page.toString())
    if (params.size !== undefined)
      httpParams = httpParams.set('size', params.size.toString())

    return this.http.get<PagedListingResponse>(
      `${this.apiUrl}/search/paginated`,
      {
        params: httpParams,
      },
    )
  }

  createListing(listing: Partial<Listing>): Observable<Listing> {
    return this.http.post<Listing>(this.apiUrl, listing)
  }

  deleteListing(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
