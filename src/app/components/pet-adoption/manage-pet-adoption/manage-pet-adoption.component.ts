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
  paginatedAdoptions: any[] = [];
  editAdoptionForm: FormGroup;
  selectedAdoption: any = null;
  adoptionToDelete: any = null;

  currentPage = 1;
  rowsPerPage = 5;
  totalPages = 0;
  rowsPerPageOptions = [5, 10, 15, 20];

  constructor(
    private firebaseService: FirebaseService,
    private fb: FormBuilder,
    private toastService: ToastrService
  ) {
    this.editAdoptionForm = this.fb.group({
      petName: ['', Validators.required],
      species: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      status: ['Pending', Validators.required] // default status Pending
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadAdoptions();
  }

  // ---------- LOAD DATA ----------
  async loadAdoptions(): Promise<void> {
    try {
      this.adoptions = await this.firebaseService.getInformation('pet-adoption');
      this.updatePagination();
    } catch (error) {
      console.error('Error fetching adoption data:', error);
      this.showToast('Error', 'Fetch Error', 'Failed to fetch adoption records.');
    }
  }

  // ---------- PAGINATION ----------
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

  // ---------- DELETE ----------
  openDeleteModal(adoption: any): void {
    this.adoptionToDelete = adoption;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.show();
  }

  closeDeleteModal(): void {
    this.adoptionToDelete = null;
    const modalEl = document.getElementById('deleteModal');
    if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
  }

  async confirmDelete(): Promise<void> {
    if (!this.adoptionToDelete) return;

    try {
      await this.firebaseService.deleteInformation('pet-adoption', this.adoptionToDelete.id);
      this.showToast('Success', 'Deleted', 'Adoption deleted successfully!');
      await this.loadAdoptions();
    } catch (error) {
      console.error('Error deleting adoption:', error);
      this.showToast('Error', 'Delete Failed', 'Failed to delete adoption.');
    }

    this.closeDeleteModal();
  }

  // ---------- EDIT ----------
  openEditForm(adoption: any): void {
    this.selectedAdoption = { ...adoption };
    this.editAdoptionForm.patchValue(adoption);
    const editModal = new bootstrap.Modal(document.getElementById('editModal')!);
    editModal.show();
  }

  closeEditForm(): void {
    const editModalEl = document.getElementById('editModal');
    if (editModalEl) bootstrap.Modal.getInstance(editModalEl)?.hide();
    this.selectedAdoption = null;
    this.editAdoptionForm.reset();
  }

  async saveAdoption(): Promise<void> {
    if (!this.editAdoptionForm.valid || !this.selectedAdoption) {
      this.showToast('Error', 'Form Invalid', 'Please fill all required fields.');
      return;
    }

    try {
      const updatedData: any = { updatedAt: Date.now() };
      Object.entries(this.editAdoptionForm.value).forEach(([key, value]) => {
        if (value !== this.selectedAdoption[key]) updatedData[key] = value;
      });

      await this.firebaseService.editInformation('pet-adoption', this.selectedAdoption.id, updatedData);
      this.showToast('Success', 'Updated', 'Adoption updated successfully!');
      this.closeEditForm();
      await this.loadAdoptions();
    } catch (error) {
      console.error('Error updating adoption:', error);
      this.showToast('Error', 'Update Failed', 'Failed to update adoption.');
    }
  }

  // ---------- STATUS TOGGLE ----------
  onStatusToggle(adoption: any): void {
    let newStatus = '';

    if (adoption.status === 'Pending') {
      newStatus = 'Active'; // Allow Pending → Active
    } else if (adoption.status === 'Active') {
      newStatus = 'Inactive';
    } else if (adoption.status === 'Inactive') {
      newStatus = 'Active';
    }

    // Update locally
    adoption.status = newStatus;

    // Update in Firebase
    this.updateAdoptionStatus(adoption.id, newStatus);

    // Show toast
    this.showToast('Success', 'Status Updated', `Adoption status changed to ${newStatus}`);
  }

  async updateAdoptionStatus(adoptionId: string, status: string): Promise<void> {
    try {
      await this.firebaseService.updateStatus('pet-adoption', adoptionId, status);
      console.log(`Adoption ${adoptionId} status updated to ${status}`);
    } catch (error) {
      console.error(`Error updating status for adoption ${adoptionId}`, error);
      this.showToast('Error', 'Update Failed', 'Failed to update adoption status.');
    }
  }

  // ---------- TOAST ----------
  showToast(type: 'Success' | 'Error' | 'Info' | 'Warning', title: string, message: string) {
    const currentTime = new Date().toLocaleTimeString();
    const fullTitle = `${title} - ${currentTime}`;

    switch (type) {
      case 'Success': this.toastService.success(message, fullTitle); break;
      case 'Error': this.toastService.error(message, fullTitle); break;
      case 'Info': this.toastService.info(message, fullTitle); break;
      case 'Warning': this.toastService.warning(message, fullTitle); break;
      default: console.error('Invalid toast type');
    }
  }

}
