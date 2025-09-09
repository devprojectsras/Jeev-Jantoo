import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { ToastrService } from 'ngx-toastr';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-add-new-feeding',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // <-- Required for formGroup
    RouterModule
  ],
  templateUrl: './add-new-food.component.html',
  styleUrls: ['./add-new-food.component.scss']
})
export class AddNewFeedingComponent implements OnInit {
  feedingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private toastService: ToastrService, 
  ) {}

  ngOnInit(): void {
    this.feedingForm = this.fb.group({
      name: ['', Validators.required],
      individual: ['', Validators.required],
      contact: ['', Validators.required],
      address: ['', Validators.required],
      food_items: ['', Validators.required],
      remarks: ['']
    });
  }

  onSubmit(): void {
    if (this.feedingForm.valid) {
      const formValue = this.feedingForm.value;
      const feedingData = {
  id: uuidv4(),
  name: formValue.name,
  individual: formValue.individual,
  contact: formValue.contact,
  address: formValue.address,
  food_items: formValue.food_items.split('\n'), // convert each line into an array
  remarks: formValue.remarks,
  lat: formValue.lat || null,
  lng: formValue.lng || null,
  status: 'Active',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

      this.firebaseService.addInformation(feedingData.id, feedingData, 'food')
        .then(() => {
          this.toastService.success(`Feeding entry for "${formValue.name}" added successfully!`);
          this.feedingForm.reset();
        })
        .catch(err => {
          console.error(err);
          this.toastService.error(`Failed to add Feeding entry for "${formValue.name}".`);
        });
    } else {
      this.toastService.error('Please fill all required fields.');
    }
  }

 
}
