import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SystemConfigDTO } from '../models/system-config.model';

@Injectable({
  providedIn: 'root'
})
export class SystemConfigService {

  private apiUrl = `${environment.apiUrl}/system-config`;

  constructor(private http: HttpClient) {}

  getAllConfigs(): Observable<SystemConfigDTO[]> {
    return this.http.get<SystemConfigDTO[]>(this.apiUrl);
  }

  getConfigByKey(key: string): Observable<SystemConfigDTO> {
    return this.http.get<SystemConfigDTO>(`${this.apiUrl}/${key}`);
  }

  updateConfig(key: string, dto: SystemConfigDTO): Observable<SystemConfigDTO> {
    return this.http.put<SystemConfigDTO>(`${this.apiUrl}/${key}`, dto);
  }
}
