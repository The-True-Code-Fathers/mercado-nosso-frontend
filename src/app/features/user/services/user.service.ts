import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { AuthService } from '../../../shared/services/auth.service'

export interface LoginRequest {
  email: string
  passwordHash: string
}

export interface UpdateUserRequest {
  fullName: string
  profilePictureUrl?: string
  email: string
  telephoneNumber?: string
  cnpj?: string
  socialReason?: string
  isSeller?: boolean
  cep?: string
}

export interface BecomeSellerRequest {
  fullName: string
  email: string
  cnpj: string
  socialReason: string
  isSeller: boolean
}

export interface CreateUserRequest {
  fullName: string
  email: string
  passwordHash: string
  cpf: string
  cnpj: string
  isSeller: boolean
  cep?: string
}

export interface UserResponse {
  id: string
  fullName: string
  email: string
  isSeller: boolean
  profilePictureUrl?: string | null
  listingSellingId?: string[] | null
  listingBoughtId?: string[] | null
  telephoneNumber?: string | null
  createdAt: string
  updatedAt: string
  active: boolean
  cep?: string | null
  socialReason?: string | null
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userApiUrl = 'http://localhost:8080/api/users'

  constructor(private http: HttpClient, private auth: AuthService) {}

  login(email: string, passwordHash: string): Observable<UserResponse> {
    const loginRequest: LoginRequest = { email, passwordHash }
    return this.http.post<UserResponse>(
      `${this.userApiUrl}/login`,
      loginRequest,
    )
  }

  createUser(request: CreateUserRequest): Observable<UserResponse> {
    console.log('Enviando para backend:', JSON.stringify(request, null, 2))
    console.log('URL:', this.userApiUrl)
    return this.http.post<UserResponse>(this.userApiUrl, request)
  }

  findByEmail(email: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.userApiUrl}/email/${email}`)
  }

  updateUser(
    userId: string,
    request: UpdateUserRequest,
  ): Observable<UserResponse> {
    // Sempre pega o userId do AuthService
    const id = this.auth.getUserId() || userId
    return this.http.patch<UserResponse>(`${this.userApiUrl}/me`, request, {
      headers: {
        'X-User-Id': id,
      },
    })
  }

  // Busca qualquer usuário pelo id (para seller, etc)
  getUserById(userId: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.userApiUrl}/${userId}`)
  }

  // Busca o usuário logado pela rota /me, usando o header X-User-Id

  becomeSeller(
    userId: string,
    request: BecomeSellerRequest,
  ): Observable<UserResponse> {
    const updateRequest: UpdateUserRequest = {
      fullName: request.fullName,
      email: request.email,
      cnpj: request.cnpj,
      socialReason: request.socialReason,
      isSeller: true,
    }
    return this.updateUser(userId, updateRequest)
  }

  getCurrentUser(userId: string): Observable<UserResponse> {
    // Só envia se for um UUID válido
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!userId || userId === '1' || !uuidRegex.test(userId)) {
      throw new Error('ID de usuário inválido para requisição /me')
    }
    return this.http.get<UserResponse>(`${this.userApiUrl}/me`, {
      headers: {
        'X-User-Id': userId,
      },
    })
  }
}
