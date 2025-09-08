import { Component, OnInit } from '@angular/core';
import { LoadCustomScriptService } from '../../services/load-custom-script.service';
import { FirebaseService } from '../../services/firebase.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  ngosCount = 0;
  spasCount = 0;
  veterinaryClinicCount = 0;
  eventsCount = 0;
  ambulanceCount = 0;
  boardingCount = 0;
  abcsCount = 0;
  govthelplineCount = 0;
  petAdoptionCount = 0;
  medicalInsuranceCount = 0;
  feedingCount = 0; 

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
    this.getGovt_Helpline();
    this.getPetAdoptionCount();
    this.getMedicalInsuranceCount();
    this.getFeedingCount(); // ✅ added
  }

  async getNgosCount(): Promise<void> {
    try { this.ngosCount = await this.firebase.getCategoryCount('ngos'); }
    catch (error) { console.error('Error fetching NGOs count:', error); }
  }

  async getSPAsCount(): Promise<void> {
    try { this.spasCount = await this.firebase.getCategoryCount('spas'); }
    catch (error) { console.error('Error fetching SPAs count:', error); }
  }

  async getV_ClinicCount(): Promise<void> {
    try { this.veterinaryClinicCount = await this.firebase.getCategoryCount('veterinaryClinic'); }
    catch (error) { console.error('Error fetching Veterinary Clinic count:', error); }
  }

  async getEventsCount(): Promise<void> {
    try { this.eventsCount = await this.firebase.getCategoryCount('events'); }
    catch (error) { console.error('Error fetching Events count:', error); }
  }

  async getAmbulanceCount(): Promise<void> {
    try { this.ambulanceCount = await this.firebase.getCategoryCount('ambulance'); }
    catch (error) { console.error('Error fetching Ambulance count:', error); }
  }

  async getABCsCount(): Promise<void> {
    try { this.abcsCount = await this.firebase.getCategoryCount('abcs'); }
    catch (error) { console.error('Error fetching ABCs count:', error); }
  }

  async getBoardingCount(): Promise<void> {
    try { this.boardingCount = await this.firebase.getCategoryCount('boarding'); }
    catch (error) { console.error('Error fetching Boarding count:', error); }
  }

  async getGovt_Helpline(): Promise<void> {
    try { this.govthelplineCount = await this.firebase.getCategoryCount('government-helpline'); }
    catch (error) { console.error('Error fetching Govt Helpline count:', error); }
  }

  async getPetAdoptionCount(): Promise<void> {
    try { this.petAdoptionCount = await this.firebase.getCategoryCount('pet-adoption'); }
    catch (error) { console.error('Error fetching Pet Adoption count:', error); }
  }

  async getMedicalInsuranceCount(): Promise<void> {
    try { 
      this.medicalInsuranceCount = await this.firebase.getCategoryCount('medical-insurance'); 
      console.log('Medical Insurance count:', this.medicalInsuranceCount);
    } catch (error) { console.error('Error fetching Medical Insurance count:', error); }
  }

  async getFeedingCount(): Promise<void> { 
    try {
      this.feedingCount = await this.firebase.getCategoryCount('feeding');
      console.log('Feeding count:', this.feedingCount);
    } catch (error) {
      console.error('Error fetching Feeding count:', error);
    }
  }
}
