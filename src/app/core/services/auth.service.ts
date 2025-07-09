import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Using signals for reactive state management
  private _currentUser = signal<User | null>(null);
  private _isAuthenticated = signal<boolean>(false);

  // Public readonly signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  constructor() {
    // Check for existing session on service initialization
    this.checkExistingSession();
  }

  login(email: string, password: string): Observable<User> {
    // Mock authentication - in real app, this would call an API
    const mockUser: User = {
      id: '1',
      name: 'João Silva',
      email: email,
      role: 'user',
    };

    this._currentUser.set(mockUser);
    this._isAuthenticated.set(true);

    // Store in localStorage for persistence
    localStorage.setItem('auth_user', JSON.stringify(mockUser));

    return of(mockUser);
  }

  logout(): void {
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    localStorage.removeItem('auth_user');
  }

  private checkExistingSession(): void {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_user');
      }
    }
  }
}
