import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchTermSubject = new BehaviorSubject<string>('')
  public searchTerm$ = this.searchTermSubject.asObservable()

  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term)
  }

  getSearchTerm(): string {
    return this.searchTermSubject.value
  }

  clearSearchTerm(): void {
    this.searchTermSubject.next('')
  }
}
