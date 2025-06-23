declare var bootstrap: any;

import { Component  } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-veterinary-clinics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './manage-veterinary-clinics.component.html',
  styleUrl: './manage-veterinary-clinics.component.scss'
})
export class ManageVeterinaryClinicsComponent {
  clinics: any[] = []; 
  editClinicForm: FormGroup;
  selectedClinic: any = null; 
  clinicToDelete: any;
  paginatedClinics: any[] = []; 
  currentPage: number = 1; 
  rowsPerPage: number = 5; 
  totalPages: number = 0; 

  rowsPerPageOptions = [5, 10, 15, 20];
  

  constructor(private firebaseService: FirebaseService, private fb: FormBuilder, private toastService:ToastrService) {
    this.editClinicForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', Validators.required],
      contact: ['', Validators.required],
      timeFrom: ['', Validators.required],
      timeTo: ['', Validators.required],
      remarks: [''],
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
    this.clinics = await this.firebaseService.getInformation('veterinaryClinic');
    
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.clinics.length / this.rowsPerPage);
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedClinics = this.clinics.slice(startIndex, endIndex);
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

  openDeleteModal(clinic: any): void {
    this.clinicToDelete = clinic;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.show();
  }
  closeDeleteModal() {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.hide();
    // this.clinicToDelete = null;
  }
 
  
  confirmDelete(): void {
    if (this.clinicToDelete) {
      this.deleteInformation(this.clinicToDelete.id);
      this.closeDeleteModal();
    }
  }
  
  async deleteInformation(clinicId: string): Promise<void> {
    try {
      await this.firebaseService.deleteInformation('veterinaryClinic', clinicId);
      this.showToast('Success', 'Clinic deleted successfully!',"Success");
      await this.getInformation();
    } catch (error) {
      console.error('Error deleting clinic:', error);
      this.showToast('Error', 'Failed to delete clinic. Please try again.',"Error");
    }
  }
  
  

  getFormattedTime(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${formattedMinutes}`;
  }


  async openEditForm(clinic: any): Promise<void> {
    this.selectedClinic ={ ...clinic}; 
    
    this.editClinicForm.patchValue(clinic);
  }
  
  closeEditForm(): void {
    this.selectedClinic = null;
    this.editClinicForm.reset();
  }
  

  onStatusToggle(clinic: any): void {
    const newStatus = clinic.status === 'Active' ? 'Inactive' : 'Active';
  
    clinic.status = newStatus;
  
    this.updateClinicStatus(clinic.id, newStatus);
  }
  
  updateClinicStatus(clinicId: string, status: string): void {
    this.firebaseService.updateStatus('veterinaryClinic', clinicId, status)
      .then(() => {
        console.log(`Clinic with ID: ${clinicId} status updated to ${status}`);
      })
      .catch((error) => {
        console.error(`Error updating status for clinic with ID: ${clinicId}`, error);
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
  


  async saveClinic(): Promise<void> {
    if (this.editClinicForm.valid && this.selectedClinic) {
      try {
        const updatedData: any = {
          updatedAt: Date.now(), 
        };
  
        for (const controlName in this.editClinicForm.value) {
          if (this.editClinicForm.value.hasOwnProperty(controlName)) {
            const formValue = this.editClinicForm.value[controlName];
            const currentClinicValue = this.selectedClinic[controlName];
            if (formValue !== currentClinicValue) {
              updatedData[controlName] = formValue;
            }
          }
        }
      
        await this.firebaseService.editInformation(
          'veterinaryClinic',
          this.selectedClinic.id,
          updatedData
        );
  
        this.showToast('Success', 'Clinic updated successfully!', 'Success');
  
        this.closeEditForm();
  
        await this.getInformation();
        this.updatePagination();
  
      } catch (error) {
        console.error('Error updating clinic:', error);
        this.showToast('Error', 'Failed to update clinic. Please try again.', 'Error');
      }
    } else {
      this.showToast('Error', 'Please fill in all required fields.', 'Error');
    }
  }
  
  
}
