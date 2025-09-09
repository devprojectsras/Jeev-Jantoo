import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service'; 
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MapComponent } from '../../../shared/map/map.component';

@Component({
  selector: 'app-add-new-abc',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, MapComponent],
  templateUrl: './add-new-abc.component.html',
  styleUrls: ['./add-new-abc.component.scss']
})
export class AddNewAbcComponent implements OnInit {
  abcsForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private firebaseService: FirebaseService, 
    private toastService: ToastrService
  ) {}

  showToast(type: 'Success' | 'Error' | 'Info' | 'Warning', title: string, message: string) {
    const currentTime = new Date().toLocaleTimeString();
    const fullTitle = `${title}  ${currentTime}`;

    switch (type) {
      case 'Success': this.toastService.success(fullTitle, message); break;
      case 'Error': this.toastService.error(fullTitle, message); break;
      case 'Info': this.toastService.info(fullTitle, message); break;
      case 'Warning': this.toastService.warning(fullTitle, message); break;
    }
  }

  ngOnInit(): void {
    this.abcsForm = this.fb.group({
      personIncharge: ['', Validators.required],
      type: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // new field
      lat: ['', [Validators.required, Validators.pattern('^-?\\d+(\\.\\d+)?$')]],    // new field
      lng: ['', [Validators.required, Validators.pattern('^-?\\d+(\\.\\d+)?$')]],    // new field
    });
  }

  onSubmit(): void {
    if (this.abcsForm.valid) {
      const formValue = this.abcsForm.value;

      const abcsData = {
        personIncharge: formValue.personIncharge,
        type: formValue.type,
        state: formValue.state,
        city: formValue.city,
        area: formValue.area,
        pincode: formValue.pincode,
        contactNumber: formValue.contactNumber, // added
        lat: parseFloat(formValue.lat),         // added
        lng: parseFloat(formValue.lng),         // added
        status: "Active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docID = uuidv4();

      this.firebaseService
        .addInformation(docID, abcsData, "abcs")
        .then((response) => {
          this.showToast("Success", `ABCs "${formValue.personIncharge}" added successfully!`, 'Success');
          this.abcsForm.reset();
        })
        .catch((error) => {
          console.error('Error saving ABCs:', error);
          this.showToast("Error", `Failed to add ABCs "${formValue.personIncharge}". Please try again.`, "Error");
        });
    } else {
      console.log('Form is not valid');
    }
  }
}
