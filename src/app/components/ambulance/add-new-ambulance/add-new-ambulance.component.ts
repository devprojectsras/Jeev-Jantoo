import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service'; 
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-add-new-ambulance',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule],
  templateUrl: './add-new-ambulance.component.html',
  styleUrl: './add-new-ambulance.component.scss'
})
export class AddNewAmbulanceComponent {
  ambulanceForm!: FormGroup;

  constructor(private fb: FormBuilder, private firebaseService: FirebaseService ,private toastService:ToastrService
  ) {}

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

  ngOnInit(): void {
    this.ambulanceForm = this.fb.group({
      name: ['', Validators.required],
      contact: ['', Validators.required],
      vehicleNumber: ['', Validators.required],
      govtBody: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', Validators.required],

    });
  }

  
  

  onSubmit(): void {
    if (this.ambulanceForm.valid) {
      const formValue = this.ambulanceForm.value;


      const ambulanceData = {
        name: formValue.name,
        contact: formValue.contact,
        vehicleNumber: formValue.vehicleNumber,
        govtBody: formValue.govtBody,
        state: formValue.state,
        city: formValue.city,
        area: formValue.area,
        pincode: formValue.pincode,
        status: "Active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docID = uuidv4();

      this.firebaseService
      .addInformation(docID, ambulanceData, "ambulance")
      .then((response) => {
        console.log('Ambulance added successfully with ID:', response);
        this.ambulanceForm.reset();
        this.showToast( "Success",`Ambulance "${formValue.name}" added successfully!`,'Success');

      })
      .catch((error) => {
        console.error('Error saving ambulance:', error);
        this.showToast("Error",`Failed to add ambulance "${formValue.name}". Please try again.`,"Error");
      });
      console.log('Form Data:', ambulanceData);
    } else {
      console.log('Form is not valid');
    }
  }
}
