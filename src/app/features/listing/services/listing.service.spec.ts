import { TestBed } from '@angular/core/testing'
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing'

import { ListingService, Listing } from './listing.service'

describe('ListingService', () => {
  let service: ListingService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ListingService],
    })
    service = TestBed.inject(ListingService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should fetch listing by id', () => {
    const mockListing: Listing = {
      listingId: '1',
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
      active: true,
      productCondition: 'new',
      createdAt: '2025-01-01',
    }

    service.getListingById('1').subscribe(listing => {
      expect(listing).toEqual(mockListing)
    })

    const req = httpMock.expectOne(`${service['apiUrl']}/1`)
    expect(req.request.method).toBe('GET')
    req.flush(mockListing)
  })

  it('should fetch all listings', () => {
    const mockListings: Listing[] = [
      {
        listingId: '1',
        title: 'Test Product 1',
        description: 'Test Description 1',
        price: 100,
        stock: 10,
        active: true,
        productCondition: 'new',
        createdAt: '2025-01-01',
      },
    ]

    service.getAllListings().subscribe(listings => {
      expect(listings.length).toBe(1)
      expect(listings).toEqual(mockListings)
    })

    const req = httpMock.expectOne(service['apiUrl'])
    expect(req.request.method).toBe('GET')
    req.flush(mockListings)
  })
})
