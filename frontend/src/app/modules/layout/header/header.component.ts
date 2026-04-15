import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  currentUser: LoginResponse | null = null;
  showDropdown = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  logout(): void {
    this.authService.logout();
  }
}
