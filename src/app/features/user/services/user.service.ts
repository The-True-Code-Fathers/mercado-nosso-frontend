import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
    email: string;
    passwordHash: string;
}

export interface CreateUserRequest {
    fullName: string;
    email: string;
    passwordHash: string;
    cpf: string;
    cnpj: string;
    isSeller: boolean;
}

export interface UserResponse {
    id: string;
    fullName: string;
    email: string;
    isSeller: boolean;
    profilePictureUrl?: string | null;
    listingSellingId?: string[] | null;
    listingBoughtId?: string[] | null;
    createdAt: string;
    updatedAt: string;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})

export class UserService {
    private userApiUrl = 'http://localhost:8080/api/users';

    constructor(private http: HttpClient) { }

    login(email: string, passwordHash: string): Observable<UserResponse> {
        const loginRequest: LoginRequest = { email, passwordHash };
        return this.http.post<UserResponse>(`${this.userApiUrl}/login`, loginRequest)
    }

    createUser(request: CreateUserRequest): Observable<UserResponse> {
        console.log('Enviando para backend:', JSON.stringify(request, null, 2));
        console.log('URL:', this.userApiUrl);
        return this.http.post<UserResponse>(this.userApiUrl, request);
    }

    findByEmail(email: string): Observable<UserResponse> {
        return this.http.get<UserResponse>(`${this.userApiUrl}/email/${email}`);
    }
}

