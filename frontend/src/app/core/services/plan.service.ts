import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlanDTO } from '../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private apiUrl = `${environment.apiUrl}/plans`;

  constructor(private http: HttpClient) {}

  getAllPlans(): Observable<PlanDTO[]> {
    return this.http.get<PlanDTO[]>(this.apiUrl);
  }

  getPlanById(id: number): Observable<PlanDTO> {
    return this.http.get<PlanDTO>(`${this.apiUrl}/${id}`);
  }

  searchPlans(name?: string, status?: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (name) params = params.set('name', name);
    if (status) params = params.set('status', status);
    return this.http.get(`${this.apiUrl}/search`, { params });
  }

  createPlan(plan: PlanDTO): Observable<PlanDTO> {
    return this.http.post<PlanDTO>(this.apiUrl, plan);
  }

  updatePlan(id: number, plan: PlanDTO): Observable<PlanDTO> {
    return this.http.put<PlanDTO>(`${this.apiUrl}/${id}`, plan);
  }

  togglePlanStatus(id: number): Observable<PlanDTO> {
    return this.http.patch<PlanDTO>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
