import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
    email: string;
    passwordHash: string;
}

export interface UserResponse {
    id: string;
    fullName: string;
    email: string;
    seller: boolean;
    profilePictureUrl: string | null;
    listingSellingId: string[] | null;
    listingBoughtId: string[] | null;
    createdAt: string;
    updatedAt: string;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})

export class UserService {
    private userApiUrl = 'http://localhost:8080/api/users';

    constructor(private http: HttpClient) {}

    login(email: string, passwordHash: string): Observable<UserResponse> {
        const loginRequest: LoginRequest = {email, passwordHash};
        return this.http.post<UserResponse>(`${this.userApiUrl}/login`, loginRequest)
    }
}
