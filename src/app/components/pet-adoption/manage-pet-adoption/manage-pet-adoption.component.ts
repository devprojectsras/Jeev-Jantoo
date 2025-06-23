declare var bootstrap: any;

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-adoption',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './manage-pet-adoption.component.html',
  styleUrls: ['./manage-pet-adoption.component.scss']
})
export class ManageAdoptionComponent implements OnInit {
  adoptions: any[] = [];
  editAdoptionForm: FormGroup;
  selectedAdoption: any = null;
  adoptionToDelete: any;
  paginatedAdoptions: any[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalPages: number = 0;
  rowsPerPageOptions = [5, 10, 15, 20];

  constructor(
    private firebaseService: FirebaseService,
    private fb: FormBuilder,
    private toastService: ToastrService
  ) {
    this.editAdoptionForm = this.fb.group({
      petName: ['', Validators.required],
      petType: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      status: ['Active', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getInformation();
    this.updatePagination();
  }

  async getInformation(): Promise<void> {
    this.adoptions = await this.firebaseService.getInformation('adoption');
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.adoptions.length / this.rowsPerPage);
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedAdoptions = this.adoptions.slice(startIndex, endIndex);
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

  openDeleteModal(adoption: any): void {
    this.adoptionToDelete = adoption;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.show();
  }

  closeDeleteModal(): void {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.hide();
    this.adoptionToDelete = null;
  }

  async confirmDelete(): Promise<void> {
    if (this.adoptionToDelete) {
      try {
        await this.firebaseService.deleteInformation('adoption', this.adoptionToDelete.id);
        this.showToast('Success', 'Adoption deleted successfully!', 'Success');
        await this.getInformation();
      } catch (error) {
        console.error('Error deleting adoption:', error);
        this.showToast('Error', 'Failed to delete adoption. Please try again.', 'Error');
      }
      this.closeDeleteModal();
    }
  }

  async openEditForm(adoption: any): Promise<void> {
    this.selectedAdoption = { ...adoption };
    this.editAdoptionForm.patchValue(adoption);
  }

  closeEditForm(): void {
    this.selectedAdoption = null;
    this.editAdoptionForm.reset();
  }

  onStatusToggle(adoption: any): void {
    const newStatus = adoption.status === 'Active' ? 'Inactive' : 'Active';
    adoption.status = newStatus;
    this.updateAdoptionStatus(adoption.id, newStatus);
  }

  async updateAdoptionStatus(adoptionId: string, status: string): Promise<void> {
    try {
      await this.firebaseService.updateStatus('adoption', adoptionId, status);
      console.log(`Adoption with ID: ${adoptionId} status updated to ${status}`);
    } catch (error) {
      console.error(`Error updating status for adoption with ID: ${adoptionId}`, error);
    }
  }

  async saveAdoption(): Promise<void> {
    if (this.editAdoptionForm.valid && this.selectedAdoption) {
      try {
        const updatedData: any = {
          updatedAt: Date.now()
        };

        for (const controlName in this.editAdoptionForm.value) {
          if (this.editAdoptionForm.value.hasOwnProperty(controlName)) {
            const formValue = this.editAdoptionForm.value[controlName];
            const currentAdoptionValue = this.selectedAdoption[controlName];
            if (formValue !== currentAdoptionValue) {
              updatedData[controlName] = formValue;
            }
          }
        }

        await this.firebaseService.editInformation(
          'adoption',
          this.selectedAdoption.id,
          updatedData
        );

        this.showToast('Success', 'Adoption updated successfully!', 'Success');
        this.closeEditForm();
        await this.getInformation();
        this.updatePagination();
      } catch (error) {
        console.error('Error updating adoption:', error);
        this.showToast('Error', 'Failed to update adoption. Please try again.', 'Error');
      }
    } else {
      this.showToast('Error', 'Please fill in all required fields.', 'Error');
    }
  }

  showToast(type: 'Success' | 'Error' | 'Info' | 'Warning', title: string, message: string) {
    const currentTime = new Date().toLocaleTimeString();
    const fullTitle = `${title} ${currentTime}`;

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
}