import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public authService: AuthService, public router: Router) {}

  get showLayout(): boolean {
    return this.authService.isLoggedIn() && !this.router.url.includes('/login');
  }
}
