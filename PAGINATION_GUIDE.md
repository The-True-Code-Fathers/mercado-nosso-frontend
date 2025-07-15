# Pagination Implementation Guide

## Overview

This implementation provides server-side pagination for the listings feature using the paginated search API. This improves performance by only loading the necessary data for each page instead of loading all items and paginating client-side.

## Key Features

### 1. Server-Side Pagination

- Uses the `/api/listings/search` endpoint with pagination parameters
- Page numbers are 0-based (first page = 0)
- Default page size is 12 items per page
- Configurable page sizes: 12, 24, 36, 48

### 2. Advanced Filtering

- **Search by name**: Search in product title and description
- **Product condition**: NEW, USED, REFURBISHED
- **Price range**: Min/max price filters
- **Category filtering**: Filter by category (from URL parameters)

### 3. Sorting Options

- Name A-Z (`NAME_ASC`)
- Name Z-A (`NAME_DESC`)
- Price Low to High (`PRICE_ASC`)
- Price High to Low (`PRICE_DESC`)
- Newest first (`CREATED_AT_DESC`)
- Oldest first (`CREATED_AT_ASC`)

## API Integration

### Search Parameters Interface

```typescript
interface SearchParams {
  name?: string // Search term for title/description
  ordering?: SearchOrdering // Sort order
  condition?: ProductCondition // Product condition filter
  minPrice?: number // Minimum price filter
  maxPrice?: number // Maximum price filter
  page?: number // Page number (0-based)
  size?: number // Items per page
}
```

### Response Format

```typescript
interface PagedListingResponse {
  content: Listing[] // Array of listings for current page
  page: number // Current page number (0-based)
  size: number // Page size
  totalElements: number // Total number of items across all pages
  totalPages: number // Total number of pages
  hasNext: boolean // Whether there's a next page
  hasPrevious: boolean // Whether there's a previous page
  empty: boolean // Whether the result set is empty
}
```

## Component Structure

### Key Properties

- `listings` - Current page listings
- `pagedResponse` - Full pagination response from API
- `currentPage` - Current page number (0-based)
- `itemsPerPage` - Number of items per page
- `totalItems` - Total number of items across all pages

### Filter Properties

- `searchTerm` - Search input value
- `selectedCondition` - Selected product condition
- `selectedCategory` - Category from URL parameters
- `minPrice` / `maxPrice` - Price range filters
- `sortBy` - Current sort order

## User Experience Features

### 1. Real-time Search

- Search input triggers API call on value change
- Debounced to prevent excessive API calls
- Resets to first page on new search

### 2. Filter Management

- Active filters displayed as removable chips
- Individual filter clearing
- "Clear all filters" functionality
- Filter count indicator

### 3. Pagination Controls

- PrimeNG Paginator component
- First/previous/next/last navigation
- Page size selector (12, 24, 36, 48)
- Current page report ("Showing X to Y of Z products")

### 4. Loading States

- Loading spinner during API calls
- Error handling with retry functionality
- Empty state when no results found

## Performance Benefits

1. **Reduced Data Transfer**: Only loads data for current page
2. **Faster Initial Load**: No need to load all products upfront
3. **Server-Side Filtering**: Efficient database queries instead of client-side filtering
4. **Memory Efficiency**: Lower memory usage for large datasets

## Mobile Responsiveness

- Collapsible filter sidebar on mobile
- Touch-friendly pagination controls
- Responsive grid layout

## Usage Example

```typescript
// Load first page with filters
this.loadListings()

// Navigate to specific page
this.goToPage(2)

// Apply search filter
this.searchTerm = 'smartphone'
this.onSearchTermChange()

// Apply condition filter
this.selectCondition('NEW')

// Clear all filters
this.clearFilters()
```

## API Endpoint

The component expects the backend API to be available at:

```
GET /api/listings/search?name={search}&condition={condition}&minPrice={min}&maxPrice={max}&page={page}&size={size}&ordering={sort}
```

## Error Handling

- Network errors display user-friendly error message
- Retry functionality available
- Fallback to empty state when appropriate
- Console logging for debugging

This implementation provides a robust, performant, and user-friendly pagination system that scales well with large datasets.
