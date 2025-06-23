import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service'; 
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-new-event',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './add-new-event.component.html',
  styleUrl: './add-new-event.component.scss'
})
export class AddNewEventComponent {
  eventsForm!: FormGroup;

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
    this.eventsForm = this.fb.group({
      name: ['', Validators.required],
      contactPerson: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      timeFrom: ['', Validators.required],
      timeTo: ['', Validators.required],
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
    if (this.eventsForm.valid) {
      const formValue = this.eventsForm.value;


      const eventsData = {
        name: formValue.name,
        contactPerson: formValue.contactPerson,
        state: formValue.state,
        city: formValue.city,
        area: formValue.area,
        pincode: formValue.pincode,
        timeFrom: formValue.timeFrom,
        timeTo: formValue.timeTo,
        status: "Active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docID = uuidv4();

      this.firebaseService
      .addInformation(docID, eventsData, "events")
      .then((response) => {
        console.log('Events added successfully with ID:', response);
        this.eventsForm.reset();
        this.showToast( "Success",`Events "${formValue.name}" added successfully!`,'Success');

      })
      .catch((error) => {
        console.error('Error saving events:', error);
        this.showToast("Error",`Failed to add events  "${formValue.name}". Please try again.`,"Error");
      });
      console.log('Form Data:', eventsData);
    } else {
      console.log('Form is not valid');
    }
  }
}
