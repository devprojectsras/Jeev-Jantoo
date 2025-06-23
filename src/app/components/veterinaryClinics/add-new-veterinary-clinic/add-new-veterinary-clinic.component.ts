import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service'; 
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-new-veterinary-clinic',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './add-new-veterinary-clinic.component.html',
  styleUrls: ['./add-new-veterinary-clinic.component.scss']
})
export class AddNewVeterinaryClinicComponent implements OnInit {
  clinicForm!: FormGroup;

  constructor(private fb: FormBuilder, private firebaseService: FirebaseService,private toastService:ToastrService ) {}

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
    this.clinicForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      contact: ['', Validators.required],
      timeFrom: ['', Validators.required],
      timeTo: ['', Validators.required],
      remarks: ['', Validators.maxLength(255)]
    });
  }

  
  convertTo12HourFormat(time: string): string {
    if (!time) return ''; 
    const [hours, minutes] = time.split(':');
    let hours12 = parseInt(hours, 10);
    const period = hours12 >= 12 ? 'PM' : 'AM';

    if (hours12 > 12) {
      hours12 = hours12 - 12;
    } else if (hours12 === 0) {
      hours12 = 12; 
    }

    return `${hours12}:${minutes} ${period}`;
  }

  onSubmit(): void {
    if (this.clinicForm.valid) {
      const formValue = this.clinicForm.value;
      const clinicData = {
        name: formValue.name,
        type: formValue.type,
        state: formValue.state,
        city: formValue.city,
        area: formValue.area,
        pincode: formValue.pincode,
        contact: formValue.contact,
        timeFrom: formValue.timeFrom,
        timeTo: formValue.timeTo,
        remarks: formValue.remarks,
        status: "Active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docID = uuidv4();

      this.firebaseService
      .addInformation(docID, clinicData, "veterinaryClinic")
      .then((response) => {
        console.log('Clinic added successfully with ID:', response);
        this.clinicForm.reset();
        this.showToast( "Success",`Clinic "${formValue.name}" added successfully!`,'Success');

     
      })
      .catch((error) => {
        console.error('Error saving clinic:', error);
        this.showToast("Error",`Failed to add clinic "${formValue.name}". Please try again.`,"Error");
      });
      console.log('Form Data:', clinicData);
    } else {
      console.log('Form is not valid');
    }
  }
}
