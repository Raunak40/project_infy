import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      // Check role-based access if roles are specified in route data
      const requiredRoles = route.data['roles'] as string[];
      if (requiredRoles && requiredRoles.length > 0) {
        if (this.authService.hasAnyRole(requiredRoles)) {
          return true;
        }
        this.router.navigate(['/access-denied']);
        return false;
      }
      return true;
    }

    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
