import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  userName = '';
  userRoles: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name;
      this.userRoles = user.roles;
    }
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }
}
