import { Injectable } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'userId'

  setUserId(id: string) {
    localStorage.setItem(this.STORAGE_KEY, id)
  }

  getUserId(): string | null {
    return localStorage.getItem(this.STORAGE_KEY)
  }

  clearUserId() {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}
