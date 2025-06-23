import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    private autoLogoutTimer: any;
  constructor(private firebaseService: FirebaseService,private router: Router) {}

  logout(): void {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('sessionExpiry');
    this.router.navigate(['/login']);
  }
}
