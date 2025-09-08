declare var bootstrap: any;

import { Component  } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-ambulance',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './manage-ambulance.component.html',
  styleUrl: './manage-ambulance.component.scss'
})
export class ManageAmbulanceComponent {
  ambulances: any[] = []; 
  editambulanceForm: FormGroup;
  selectedambulance: any = null; 
  ambulanceToDelete: any;
  paginatedambulances: any[] = []; 
  currentPage: number = 1; 
  rowsPerPage: number = 5; 
  totalPages: number = 0; 

  rowsPerPageOptions = [5, 10, 15, 20];
  

  constructor(private firebaseService: FirebaseService, private fb: FormBuilder , private toastService:ToastrService
  ) {
   this.editambulanceForm = this.fb.group({
  name: ['', Validators.required],
  vehicleNumber: ['', Validators.required],
  govtBody: ['', Validators.required],
  state: ['', Validators.required],
  city: ['', Validators.required],
  area: ['', Validators.required],
  pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
  lat: ['', Validators.required],   // ✅ new
  lng: ['', Validators.required],   // ✅ new
  status: ['', Validators.required],
});

  }

  showToast(type: 'Success' | 'Error' | 'Info' | 'Warning', title: string, message: string) {
    const currentTime = new Date().toLocaleTimeString();
    const fullTitle = `${title}  ${currentTime}`;

    switch (type) {
      case 'Success':
        this.toastService.success(fullTitle, message);
        break;
      case 'Error':
        this.toastService.error(fullTitle, message);
        break;
      case 'Info':
        this.toastService.info(fullTitle, message);
        break;
      case 'Warning':
        this.toastService.warning(fullTitle, message);
        break;
      default:
        console.error('Invalid toast type');
    }
  }

  async ngOnInit(): Promise<void> {
    await this.getInformation(); 
    this.updatePagination();
  }


  async getInformation(): Promise<void> {
    this.ambulances = await this.firebaseService.getInformation('ambulance');
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.ambulances.length / this.rowsPerPage);
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedambulances = this.ambulances.slice(startIndex, endIndex);
  }

  changeRowsPerPage(rows: number): void {
    this.rowsPerPage = rows;
    this.currentPage = 1; 
    this.updatePagination();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  openDeleteModal(ambulance: any): void {
    this.ambulanceToDelete = ambulance;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.show();
  }
  closeDeleteModal() {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.hide();
    this.ambulanceToDelete = null;
  }
 
  
  confirmDelete(): void {
    if (this.ambulanceToDelete) {
      this.deleteInformation(this.ambulanceToDelete.id);
      this.closeDeleteModal();
    }
  }
  
  async deleteInformation(ambulanceId: string): Promise<void> {
    try {
      await this.firebaseService.deleteInformation('ambulance', ambulanceId);
      this.showToast('Success', 'ambulance deleted successfully!', 'Success');
      await this.getInformation();
    } catch (error) {
      console.error('Error deleting ambulance:', error);
      this.showToast('Error', 'Failed to delete ambulance. Please try again.', 'Error');
    }
  }
  
 

  async openEditForm(ambulance: any): Promise<void> {
    this.selectedambulance ={ ...ambulance}; 
    this.editambulanceForm.patchValue(ambulance);
  }
  
  closeEditForm(): void {
    this.selectedambulance = null;
    this.editambulanceForm.reset();
  }
  

  onStatusToggle(ambulance: any): void {
    const newStatus = ambulance.status === 'Active' ? 'Inactive' : 'Active';
  
    ambulance.status = newStatus;
  
    this.updateambulanceStatus(ambulance.id, newStatus);
  }
  
  updateambulanceStatus(ambulanceId: string, status: string): void {
    this.firebaseService.updateStatus('ambulance', ambulanceId, status)
      .then(() => {
        console.log(`ambulance with ID: ${ambulanceId} status updated to ${status}`);
      })
      .catch((error) => {
        console.error(`Error updating status for ambulance with ID: ${ambulanceId}`, error);
      });
  }
  convertTo12HourFormat(time: string): string {
    if (!time) return ''; 
    const [hours, minutesWithPeriod] = time.split(':');
    const minutes = minutesWithPeriod.slice(0, 2); 
    const period = minutesWithPeriod.slice(2).trim(); 
  
    let hours12 = parseInt(hours, 10);
    let finalPeriod = period || (hours12 >= 12 ? 'PM' : 'AM'); 
  
    if (hours12 === 0) {
      hours12 = 12; 
    } else if (hours12 > 12) {
      hours12 = hours12 - 12; 
    }
  
    if (finalPeriod && (finalPeriod === 'AM' || finalPeriod === 'PM')) {
      return `${hours12}:${minutes} ${finalPeriod}`;
    }
  
    return `${hours12}:${minutes} ${finalPeriod}`;
  }
  


  async saveambulance(): Promise<void> {
    if (this.editambulanceForm.valid && this.selectedambulance) {
      try {
        const updatedData: any = {
          updatedAt: Date.now(), 
        };
  
        for (const controlName in this.editambulanceForm.value) {
          if (this.editambulanceForm.value.hasOwnProperty(controlName)) {
            const formValue = this.editambulanceForm.value[controlName];
            const currentambulanceValue = this.selectedambulance[controlName];
            if (formValue !== currentambulanceValue) {
              updatedData[controlName] = formValue;
            }
          }
        }
        updatedData.timeFrom = this.convertTo12HourFormat(updatedData.timeFrom || this.selectedambulance.timeFrom);
        updatedData.timeTo = this.convertTo12HourFormat(updatedData.timeTo || this.selectedambulance.timeTo);
  
        await this.firebaseService.editInformation(
          'ambulance',
          this.selectedambulance.id,
          updatedData
        );
  
        this.showToast('Success', 'ambulance updated successfully!', 'Success');
  
        this.closeEditForm();
  
        await this.getInformation();
        this.updatePagination();
  
      } catch (error) {
        console.error('Error updating ambulance:', error);
        this.showToast('Error', 'Failed to update ambulance. Please try again.', 'Error');
      }
    } else {
      this.showToast('Error', 'Please fill in all required fields.', 'Error');
    }
  }
  
}
