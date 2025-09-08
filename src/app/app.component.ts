import { Component, HostListener} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
  title = 'jeevjantoo-backend';
  private autoLogoutTimer: any;
  constructor(private router: Router) { }

 
  @HostListener('window:popstate', ['$event'])
  onPopState(): void {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    const currentTime = new Date().getTime();

    if (!isAuthenticated || (sessionExpiry && currentTime > parseInt(sessionExpiry, 10))) {
      this.router.navigate(['/login']);
    }
  }
  startAutoLogoutTimer(duration: number): void {
    this.clearAutoLogoutTimer();
    this.autoLogoutTimer = setTimeout(() => {
      localStorage.clear();
      location.reload(); // Redirect to login
    }, duration);
  }

  clearAutoLogoutTimer(): void {
    if (this.autoLogoutTimer) {
      clearTimeout(this.autoLogoutTimer);
    }
  }
}
