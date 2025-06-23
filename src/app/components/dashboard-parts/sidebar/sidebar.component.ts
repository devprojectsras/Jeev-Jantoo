import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  activeItem = "dashboard";

  veterinaryClinicMenu = "none";
  ngoMenu = "none";
  eventMenu = "none";
  ambulanceMenu = "none";
  boardingMenu = "none";
  abcMenu = "none";
  spaMenu = "none";
  govtHelplineMenu = "none";
  userMenu = "none";
  transactionMenu = "none";

  toggleDropdown(menu: string) {
    this.activeItem = menu;

    // const menuItems = [
    //   this.veterinaryClinicMenu,
    //   this.ngoMenu,
    //   this.eventMenu,
    //   this.ambulanceMenu,
    //   this.boardingMenu,
    //   this.abcMenu,
    //   this.spaMenu,
    //   this.govtHelplineMenu,
    //   this.userMenu,
    //   this.transactionMenu
    // ];
    // menuItems.forEach((item: any) => {
    //   item = "none";
    // });

    switch (menu) {
      case "veterinary-clinic":
        this.veterinaryClinicMenu = this.veterinaryClinicMenu === "flex" ? "none" : "flex";
        break;
      case "ngo":
        this.ngoMenu = this.ngoMenu === "flex" ? "none" : "flex";
        break;
      case "event":
        this.eventMenu = this.eventMenu === "flex" ? "none" : "flex";
        break;
      case "ambulance":
        this.ambulanceMenu = this.ambulanceMenu === "flex" ? "none" : "flex";
        break;
      case "boarding":
        this.boardingMenu = this.boardingMenu === "flex" ? "none" : "flex";
        break;
      case "abc":
        this.abcMenu = this.abcMenu === "flex" ? "none" : "flex";
        break;
      case "spa":
        this.spaMenu = this.spaMenu === "flex" ? "none" : "flex";
        break;
      case "govt-helpline":
        this.govtHelplineMenu = this.govtHelplineMenu === "flex" ? "none" : "flex";
        break;
      case "users":
        this.userMenu = this.userMenu === "flex" ? "none" : "flex";
        break;
      case "transaction":
        this.transactionMenu = this.transactionMenu === "flex" ? "none" : "flex";
        break;
    
      default:
        console.log("DEFAULT dropdown");
        break;
    }
  }
}
