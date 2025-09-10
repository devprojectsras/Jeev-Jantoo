import { Component, OnInit } from '@angular/core';
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
export class ManageFoodComponent implements OnInit {
  foods: any[] = [];
  paginatedFoods: any[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalPages: number = 0;
  rowsPerPageOptions = [5, 10, 15, 20];

  selectedFood: any = null;   // for edit modal
  foodToDelete: any = null;   // for delete modal
  editFoodForm: FormGroup;

  constructor(
    private firebaseService: FirebaseService,
    private fb: FormBuilder,
    private toastService: ToastrService
  ) {
    this.editFoodForm = this.fb.group({
      name: ['', Validators.required],
      individual: ['', Validators.required],
      contact: ['', Validators.required],
      address: ['', Validators.required],
      food_items: [''],
      status: ['', Validators.required],
      lat: [''],
      lng: ['']
    });
  }

  ngOnInit(): void {
    this.loadFoods();
  }

  async loadFoods(): Promise<void> {
    try {
      this.foods = await this.firebaseService.getInformation('food');
      if (!Array.isArray(this.foods)) this.foods = [];

      // normalize food_items
      this.foods = this.foods.map(food => ({
        ...food,
        food_items: Array.isArray(food.food_items)
          ? food.food_items
          : food.food_items
            ? [food.food_items]
            : []
      }));

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
      case 'Success': this.toastService.success(message, fullTitle); break;
      case 'Error': this.toastService.error(message, fullTitle); break;
      case 'Info': this.toastService.info(message, fullTitle); break;
      case 'Warning': this.toastService.warning(message, fullTitle); break;
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

  // ---- Edit Modal ----
  openEditForm(food: any): void {
    this.selectedFood = { ...food };
    this.editFoodForm.patchValue({
      ...food,
      food_items: food.food_items.join(', ')
    });
  }

  closeEditForm(): void {
    this.selectedFood = null;
    this.editFoodForm.reset();
  }

  async saveFood(): Promise<void> {
    if (this.editFoodForm.valid && this.selectedFood) {
      const updatedData: any = { updatedAt: Date.now(), ...this.editFoodForm.value };

      // Convert food_items back to array
      if (typeof updatedData.food_items === 'string') {
        updatedData.food_items = updatedData.food_items.split(',').map((i: string) => i.trim());
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

  // ---- Delete Modal ----
  openDeleteModal(food: any): void {
    this.foodToDelete = food;
  }

  closeDeleteModal(): void {
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
