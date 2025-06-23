import { Component,OnInit} from '@angular/core';
import { LoadCustomScriptService } from '../../services/load-custom-script.service';
import { FirebaseService } from '../../services/firebase.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  ngosCount: number = 0;  
  spasCount : number = 0;
  veterinaryClinicCount : number = 0;
  eventsCount : number = 0;
  ambulanceCount : number = 0;
  boardingCount : number = 0;
  abcsCount : number = 0;
  govthelplineCount : number = 0;

  constructor(
    private scriptService: LoadCustomScriptService,
    private firebase: FirebaseService
  ) {}

  ngOnInit() {
    this.scriptService.loadDashboardScripts();
    this.getNgosCount();
    this.getSPAsCount();
    this.getV_ClinicCount();
    this.getEventsCount();
    this.getAmbulanceCount();
    this.getBoardingCount();
    this.getABCsCount();
    this.getGovt_Helpline()
  }

  async getNgosCount(): Promise<void> {
    try {
      this.ngosCount = await this.firebase.getCategoryCount('ngos');
    } catch (error) {
      console.error('Error fetching NGOs count:', error);
    }
  }
  async getSPAsCount(): Promise<void> {
    try {
      this.spasCount = await this.firebase.getCategoryCount('spas');
    } catch (error) {
      console.error('Error fetching NGOs count:', error);
    }
  }
  async getV_ClinicCount(): Promise<void> {
    try {
      this.veterinaryClinicCount = await this.firebase.getCategoryCount('veterinaryClinic');
    } catch (error) {
      console.error('Error fetching NGOs count:', error);
    }
  }
  async getEventsCount(): Promise<void> {
    try {
      this.eventsCount = await this.firebase.getCategoryCount('events');
    } catch (error) {
      console.error('Error fetching NGOs count:', error);
    }
  }
  async getAmbulanceCount(): Promise<void> {
    try {
      this.ambulanceCount = await this.firebase.getCategoryCount('ambulance');
    } catch (error) {
      console.error('Error fetching NGOs count:', error);
    }
  }
  async getABCsCount(): Promise<void> {
    try {
      this.abcsCount = await this.firebase.getCategoryCount('abcs');
    } catch (error) {
      console.error('Error fetching NGOs count:', error);
    }
  }
  async getBoardingCount(): Promise<void> {
    try {
      this.boardingCount = await this.firebase.getCategoryCount('spas');
    } catch (error) {
      console.error('Error fetching NGOs count:', error);
    }
  }
  async getGovt_Helpline(): Promise<void> {
    try {
      this.govthelplineCount = await this.firebase.getCategoryCount('government-helpline');
    } catch (error) {
      console.error('Error fetching NGOs count:', error);
    }
  }

}
