import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerDTO } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private apiUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getAllCustomers(): Observable<CustomerDTO[]> {
    return this.http.get<CustomerDTO[]>(this.apiUrl);
  }

  getCustomerById(id: number): Observable<CustomerDTO> {
    return this.http.get<CustomerDTO>(`${this.apiUrl}/${id}`);
  }

  searchCustomers(search?: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (search) params = params.set('search', search);
    return this.http.get(`${this.apiUrl}/search`, { params });
  }

  createCustomer(customer: CustomerDTO): Observable<CustomerDTO> {
    return this.http.post<CustomerDTO>(this.apiUrl, customer);
  }

  updateCustomer(id: number, customer: CustomerDTO): Observable<CustomerDTO> {
    return this.http.put<CustomerDTO>(`${this.apiUrl}/${id}`, customer);
  }

  softDeleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  exportCsv(): Observable<string> {
    return this.http.get(`${this.apiUrl}/export/csv`, { responseType: 'text' });
  }
}
