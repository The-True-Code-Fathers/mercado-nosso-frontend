import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/orders/seller';

  constructor(private http: HttpClient) {}

  getDashboardData(sellerId: string, period: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${sellerId}/dashboard`, {
      params: { period: period }
    });
  }

  exportReport(sellerId: string, type: 'pdf' | 'excel') {
  return this.http.get(
    `http://localhost:8080/api/orders/seller/${sellerId}/export?type=${type}`,
    { responseType: 'blob' }
  );
}
}