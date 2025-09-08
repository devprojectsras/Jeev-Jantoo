import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service'; 
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-new-boarding',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './add-new-boarding.component.html',
  styleUrl: './add-new-boarding.component.scss'
})
export class AddNewBoardingComponent implements OnInit {
  boardingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private toastService: ToastrService
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
    this.boardingForm = this.fb.group({
      name: ['', Validators.required],
      contact: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      timeFrom: ['', Validators.required],
      timeTo: ['', Validators.required],
      lat: ['', [Validators.required, Validators.pattern('^-?\\d+(\\.\\d+)?$')]],  // latitude
      lng: ['', [Validators.required, Validators.pattern('^-?\\d+(\\.\\d+)?$')]]   // longitude
    });
  }

  convertTo12HourFormat(time: string): string {
    if (!time) return ''; 
    const [hours, minutes] = time.split(':');
    let hours12 = parseInt(hours, 10);
    const period = hours12 >= 12 ? 'PM' : 'AM';
    if (hours12 > 12) hours12 -= 12;
    else if (hours12 === 0) hours12 = 12;
    return `${hours12}:${minutes} ${period}`;
  }

  onSubmit(): void {
    if (this.boardingForm.valid) {
      const formValue = this.boardingForm.value;

      const boardingData = {
        name: formValue.name,
        contact: formValue.contact,
        state: formValue.state,
        city: formValue.city,
        area: formValue.area,
        pincode: formValue.pincode,
        timeFrom: formValue.timeFrom,
        timeTo: formValue.timeTo,
        lat: Number(formValue.lat),
        lng: Number(formValue.lng),
        status: "Active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docID = uuidv4();

      this.firebaseService
        .addInformation(docID, boardingData, "boardings")
        .then((response) => {
          console.log('Boarding added successfully with ID:', response);
          this.boardingForm.reset();
          this.showToast("Success", `Boarding "${formValue.name}" added successfully!`, 'Success');
        })
        .catch((error) => {
          console.error('Error saving boarding:', error);
          this.showToast("Error", `Failed to add boarding "${formValue.name}". Please try again.`, "Error");
        });

      console.log('Form Data:', boardingData);
    } else {
      console.log('Form is not valid');
    }
  }
}
