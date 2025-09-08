declare var bootstrap: any;

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirebaseService } from '../../../services/firebase.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-food',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './manage-food.component.html',
  styleUrls: ['./manage-food.component.scss']
})
export class ManageFoodComponent implements OnInit, AfterViewInit {
  foods: any[] = [];
  paginatedFoods: any[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalPages: number = 0;
  rowsPerPageOptions = [5, 10, 15, 20];

  selectedFood: any = null;
  foodToDelete: any = null;
  editFoodForm: FormGroup;

  private deleteModal: any;

  constructor(
    private firebaseService: FirebaseService,
    private fb: FormBuilder,
    private toastService: ToastrService
  ) {
    this.editFoodForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      quantity: ['', Validators.required],
      remarks: [''],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadFoods();
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

  async loadFoods(): Promise<void> {
    try {
      this.foods = await this.firebaseService.getInformation('food');
      if (!Array.isArray(this.foods)) this.foods = [];
      this.updatePagination();
    } catch (error) {
      console.error(error);
      this.showToast('Error', 'Failed to load food data', 'Error');
    }
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.foods.length / this.rowsPerPage);
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedFoods = this.foods.slice(startIndex, endIndex);
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
    }
  }

  onStatusToggle(food: any): void {
    const newStatus = food.status === 'Active' ? 'Inactive' : 'Active';
    food.status = newStatus;
    this.firebaseService.updateStatus('food', food.id, newStatus)
      .then(() => this.showToast('Success', 'Status Updated', `${food.name} is now ${newStatus}`))
      .catch(err => {
        console.error(err);
        this.showToast('Error', 'Failed to update status', `${food.name}`);
      });
  }

  openEditForm(food: any): void {
    this.selectedFood = { ...food };
    this.editFoodForm.patchValue(food);
  }

  closeEditForm(): void {
    this.selectedFood = null;
    this.editFoodForm.reset();
  }

  async saveFood(): Promise<void> {
    if (this.editFoodForm.valid && this.selectedFood) {
      const updatedData: any = { updatedAt: Date.now() };
      for (const key in this.editFoodForm.value) {
        if (this.editFoodForm.value[key] !== this.selectedFood[key]) {
          updatedData[key] = this.editFoodForm.value[key];
        }
      }

      try {
        await this.firebaseService.editInformation('food', this.selectedFood.id, updatedData);
        this.showToast('Success', 'Food Updated', `${this.selectedFood.name} updated successfully`);
        this.closeEditForm();
        await this.loadFoods();
      } catch (err) {
        console.error(err);
        this.showToast('Error', 'Failed to update food', `${this.selectedFood.name}`);
      }
    } else {
      this.showToast('Error', 'Invalid Form', 'Please fill all required fields');
    }
  }

  openDeleteModal(food: any): void {
    this.foodToDelete = food;
    if (this.deleteModal) {
      this.deleteModal.show();
    }
  }

  closeDeleteModal(): void {
    if (this.deleteModal) {
      this.deleteModal.hide();
    }
    this.foodToDelete = null;
  }

  async confirmDelete(): Promise<void> {
    if (this.foodToDelete) {
      try {
        await this.firebaseService.deleteInformation('food', this.foodToDelete.id);
        this.showToast('Success', 'Food Deleted', `${this.foodToDelete.name} deleted successfully`);
        this.closeDeleteModal();
        await this.loadFoods();
      } catch (err) {
        console.error(err);
        this.showToast('Error', 'Failed to delete food', `${this.foodToDelete.name}`);
      }
    }
  }
}