declare var bootstrap: any;

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FirebaseService } from '../../../services/firebase.service';

interface MedicalInsurance {
  id: string;
  providerName: string;
  coverage: string;
  contact: string;
  website?: string;
  remarks?: string;
  status: string; // Active / Inactive
}

@Component({
  selector: 'app-manage-medical-insurance',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './manage-medical-insurance.component.html',
  styleUrls: ['./manage-medical-insurance.component.scss']
})
export class ManageMedicalInsuranceComponent implements OnInit, AfterViewInit {
  insurances: MedicalInsurance[] = [];
  paginatedInsurances: MedicalInsurance[] = [];
  selectedInsurance: MedicalInsurance | null = null;
  insuranceToDelete: MedicalInsurance | null = null;

  editInsuranceForm: FormGroup;
  private deleteModal: any;

  currentPage = 1;
  rowsPerPage = 5;
  totalPages = 0;
  rowsPerPageOptions = [5, 10, 15, 20];

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private toastService: ToastrService
  ) {
    this.editInsuranceForm = this.fb.group({
      providerName: ['', Validators.required],
      coverage: ['', Validators.required],
      contact: ['', Validators.required],
      website: [''],
      remarks: [''],
      status: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadInsurances();
  }

  ngAfterViewInit(): void {
    // Initialize Bootstrap modal
    setTimeout(() => {
      const modalElement = document.getElementById('deleteModal');
      if (modalElement) {
        this.deleteModal = new bootstrap.Modal(modalElement);
      }
    }, 0);

    // Initialize Bootstrap dropdowns with custom Popper configuration
    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach((dropdown) => {
      new bootstrap.Dropdown(dropdown, {
        popperConfig: {
          placement: 'bottom-end',
          strategy: 'fixed'
        }
      });
    });
  }

  async loadInsurances() {
    try {
      this.insurances = await this.firebaseService.getInformation('medical-insurance');
      if (!Array.isArray(this.insurances)) this.insurances = [];
      this.updatePagination();
    } catch (error) {
      console.error(error);
      this.toastService.error('Failed to load insurance data', 'Error');
    }
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.insurances.length / this.rowsPerPage);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedInsurances = this.insurances.slice(start, end);
  }

  changePage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  changeRowsPerPage(rows: number) {
    this.rowsPerPage = rows;
    this.currentPage = 1;
    this.updatePagination();
  }

  openEditForm(insurance: MedicalInsurance) {
    this.selectedInsurance = { ...insurance };
    this.editInsuranceForm.patchValue(insurance);
  }

  closeEditForm() {
    this.selectedInsurance = null;
    this.editInsuranceForm.reset();
  }

  async saveInsurance() {
    if (this.selectedInsurance && this.editInsuranceForm.valid) {
      const updatedData = { ...this.editInsuranceForm.value, updatedAt: Date.now() };
      try {
        await this.firebaseService.editInformation('medical-insurance', this.selectedInsurance.id, updatedData);
        this.toastService.success('Insurance updated successfully', 'Success');
        this.closeEditForm();
        await this.loadInsurances();
      } catch (error) {
        console.error(error);
        this.toastService.error('Failed to update insurance', 'Error');
      }
    } else {
      this.toastService.error('Please fill all required fields', 'Error');
    }
  }

  openDeleteModal(insurance: MedicalInsurance) {
    this.insuranceToDelete = insurance;
    if (this.deleteModal) {
      this.deleteModal.show();
    }
  }

  closeDeleteModal() {
    if (this.deleteModal) {
      this.deleteModal.hide();
    }
    this.insuranceToDelete = null;
  }

  async confirmDelete() {
    if (this.insuranceToDelete) {
      try {
        await this.firebaseService.deleteInformation('medical-insurance', this.insuranceToDelete.id);
        this.toastService.success('Insurance deleted successfully', 'Success');
        this.closeDeleteModal();
        await this.loadInsurances();
      } catch (error) {
        console.error(error);
        this.toastService.error('Failed to delete insurance', 'Error');
      }
    }
  }

  onStatusToggle(insurance: MedicalInsurance) {
    const newStatus = insurance.status === 'Active' ? 'Inactive' : 'Active';
    insurance.status = newStatus;
    this.firebaseService.updateStatus('medical-insurance', insurance.id, newStatus)
      .then(() => this.toastService.success(`${insurance.providerName} is now ${newStatus}`, 'Status Updated'))
      .catch(error => {
        console.error(error);
        this.toastService.error(`Failed to update status for ${insurance.providerName}`, 'Error');
      });
  }
}