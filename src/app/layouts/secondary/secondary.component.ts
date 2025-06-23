import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/dashboard-parts/navbar/navbar.component';
import { SidebarComponent } from '../../components/dashboard-parts/sidebar/sidebar.component';
import { FooterComponent } from '../../components/dashboard-parts/footer/footer.component';

@Component({
  selector: 'app-secondary',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './secondary.component.html',
  styleUrl: './secondary.component.scss'
})
export class SecondaryComponent {

}
