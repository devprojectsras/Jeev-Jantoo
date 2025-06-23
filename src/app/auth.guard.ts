import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class authGuard implements CanActivate {
  private alertShown = false; // Ensures the alert is displayed only once during a session

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const sessionExpiry = parseInt(localStorage.getItem('sessionExpiry') || '0', 10);
    const currentTime = new Date().getTime();

    console.log('AuthGuard Debug:');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('sessionExpiry:', sessionExpiry ? new Date(sessionExpiry).toISOString() : null);
    console.log('currentTime:', new Date(currentTime).toISOString());

    if (isAuthenticated && sessionExpiry > currentTime) {
      const timeRemaining = sessionExpiry - currentTime;
      console.log(`Time remaining for session: ${timeRemaining}ms`);


      // Show alert when 1 minute (60000ms) remains
      if (timeRemaining <= 60000 && !this.alertShown) {
        this.alertShown = true; // Prevents multiple alerts
        const extendSession = confirm('Your session is about to expire. Would you like to extend it by 5 minutes?');
        
        if (extendSession) {
          const newExpiry = currentTime + 5 * 60 * 1000; // Extend session by 5 minutes
          localStorage.setItem('sessionExpiry', newExpiry.toString());
          this.alertShown = false; // Reset alert status
          console.log('Session extended by 5 minutes.');
        } else {
          console.log('User declined session extension. Session will expire soon.');
        }
      }

      if (state.url === '/login' || state.url === '/') {
        console.log('AuthGuard: Redirecting to dashboard.');
        this.router.navigate(['/dashboard']);
        return false;
      }
      console.log('AuthGuard: Access granted.');
      return true;
    }

    if (state.url === '/dashboard') {
      console.log('AuthGuard: Access denied. Redirecting to login.');
      this.router.navigate(['/login']);
      return false;
    }

    console.log('AuthGuard: Access granted to login.');
    return true;
  }
}
