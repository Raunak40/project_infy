import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserDTO, CreateUserRequest, UpdateUserRolesRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/${id}`);
  }

  createUser(request: CreateUserRequest): Observable<UserDTO> {
    return this.http.post<UserDTO>(this.apiUrl, request);
  }

  updateUserRoles(id: number, request: UpdateUserRolesRequest): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/${id}/roles`, request);
  }

  updateUserRole(id: number, role: string): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/${id}/role`, { role });
  }

  updateUserStatus(id: number, isActive: boolean): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/${id}/status`, { isActive });
  }

  toggleUserStatus(id: number): Observable<UserDTO> {
    return this.http.patch<UserDTO>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
