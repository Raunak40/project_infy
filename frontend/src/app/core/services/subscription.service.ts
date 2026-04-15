import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SubscriptionDTO } from '../models/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private apiUrl = `${environment.apiUrl}/subscriptions`;

  constructor(private http: HttpClient) {}

  getAllSubscriptions(): Observable<SubscriptionDTO[]> {
    return this.http.get<SubscriptionDTO[]>(this.apiUrl);
  }

  getSubscriptionById(id: number): Observable<SubscriptionDTO> {
    return this.http.get<SubscriptionDTO>(`${this.apiUrl}/${id}`);
  }

  getByCustomerId(customerId: number): Observable<SubscriptionDTO[]> {
    return this.http.get<SubscriptionDTO[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  searchSubscriptions(status?: string, customerId?: number, page = 0, size = 10): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (status) params = params.set('status', status);
    if (customerId) params = params.set('customerId', customerId.toString());
    return this.http.get(`${this.apiUrl}/search`, { params });
  }

  createSubscription(dto: any): Observable<SubscriptionDTO> {
    return this.http.post<SubscriptionDTO>(this.apiUrl, dto);
  }

  activate(id: number): Observable<SubscriptionDTO> {
    return this.http.patch<SubscriptionDTO>(`${this.apiUrl}/${id}/activate`, {});
  }

  suspend(id: number, reason: string): Observable<SubscriptionDTO> {
    return this.http.patch<SubscriptionDTO>(`${this.apiUrl}/${id}/suspend`, { reason });
  }

  reactivate(id: number): Observable<SubscriptionDTO> {
    return this.http.patch<SubscriptionDTO>(`${this.apiUrl}/${id}/reactivate`, {});
  }

  cancel(id: number, reason?: string): Observable<SubscriptionDTO> {
    return this.http.patch<SubscriptionDTO>(`${this.apiUrl}/${id}/cancel`, { reason });
  }
}
