import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service'; 
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-add-new-spa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './add-new-spa.component.html',
  styleUrl: './add-new-spa.component.scss'
})
export class AddNewSpaComponent {
  spasForm!: FormGroup;

  constructor(private fb: FormBuilder, private firebaseService: FirebaseService , private toastService:ToastrService
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
    this.spasForm = this.fb.group({
      name: ['', Validators.required],
      contact: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      timeFrom: ['', Validators.required],
      timeTo: ['', Validators.required],
    });
  }



  onSubmit(): void {
    if (this.spasForm.valid) {
      const formValue = this.spasForm.value;

      

      const spasData = {
        name: formValue.name,
        contact: formValue.contact,
        state: formValue.state,
        city: formValue.city,
        area: formValue.area,
        pincode: formValue.pincode,
        status: "Active",
        timeFrom: formValue.timeFrom,
        timeTo: formValue.timeTo,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docID = uuidv4();

      this.firebaseService
      .addInformation(docID, spasData, "spas")
      .then((response) => {
        console.log('Spas added successfully with ID:', response);
        this.spasForm.reset();
        this.showToast( "Success",`Spas "${formValue.name}" added successfully!`,'Success');

      })
      .catch((error) => {
        console.error('Error saving spas:', error);
        this.showToast("Error",`Failed to add spas "${formValue.name}". Please try again.`,"Error");
      });
      console.log('Form Data:', spasData);
    } else {
      console.log('Form is not valid');
    }
  }
}
