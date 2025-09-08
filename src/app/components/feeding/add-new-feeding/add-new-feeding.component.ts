import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../../../services/firebase.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-new-feeding',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './add-new-feeding.component.html',
  styleUrls: ['./add-new-feeding.component.scss']
})
export class AddNewFeedingComponent implements OnInit {
  feedingForm!: FormGroup;

  constructor(private fb: FormBuilder, private firebaseService: FirebaseService, private toastService: ToastrService) {}

  ngOnInit() {
    this.feedingForm = this.fb.group({
      name: ['', Validators.required],
      individual: ['', Validators.required],
      contact: ['', Validators.required],
      address: ['', Validators.required],
      food_items: ['', Validators.required],
      remarks: ['', Validators.maxLength(255)]
    });
  }

  showToast(type: 'Success' | 'Error', title: string, message: string) {
    const currentTime = new Date().toLocaleTimeString();
    const fullTitle = `${title} ${currentTime}`;
    if (type === 'Success') this.toastService.success(fullTitle, message);
    else this.toastService.error(fullTitle, message);
  }

  onSubmit() {
    if (this.feedingForm.valid) {
      const formValue = this.feedingForm.value;
      const feedingData = {
        name: formValue.name,
        individual: formValue.individual,
        contact: formValue.contact,
        address: formValue.address,
        food_items: formValue.food_items,
        remarks: formValue.remarks,
        status: 'Active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docID = uuidv4();

      this.firebaseService.addInformation(docID, feedingData, 'feeding')
        .then(() => {
          this.showToast('Success', 'Feeding Info Added', `Feeding entry for "${formValue.name}" added successfully!`);
          this.feedingForm.reset();
        })
        .catch((error) => {
          console.error('Error adding feeding info:', error);
          this.showToast('Error', 'Failed to add Feeding info', `Entry "${formValue.name}" could not be added.`);
        });
    } else {
      this.showToast('Error', 'Invalid Form', 'Please fill all required fields correctly.');
    }
  }
}
