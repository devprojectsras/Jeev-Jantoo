import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service'; 
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-add-new-veterinary-clinic',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './add-new-veterinary-clinic.component.html',
  styleUrls: ['./add-new-veterinary-clinic.component.scss']
})
export class AddNewVeterinaryClinicComponent implements OnInit {
  clinicForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private toastService: ToastrService,
    private http: HttpClient
  ) {}

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

  showToast(type: 'Success' | 'Error' | 'Info' | 'Warning', title: string, message: string) {
    const currentTime = new Date().toLocaleTimeString();
    const fullTitle = `${title}  ${currentTime}`;
    switch (type) {
      case 'Success': this.toastService.success(fullTitle, message); break;
      case 'Error': this.toastService.error(fullTitle, message); break;
      case 'Info': this.toastService.info(fullTitle, message); break;
      case 'Warning': this.toastService.warning(fullTitle, message); break;
      default: console.error('Invalid toast type');
    }
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

  // Fetch latitude and longitude using Google Geocoding API
  getLatLng(address: string): Promise<{ lat: number; lng: number }> {
    const apiKey = 'AIzaSyCqw385bseNmIg09N2LahHOOjIHK4UlhRc'; // replace with your API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    return this.http.get(url).toPromise().then((res: any) => {
      if (res.status === 'OK') {
        const location = res.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      } else {
        throw new Error('Could not fetch location: ' + res.status);
      }
    });
  }

  // Submit form
  async onSubmit(): Promise<void> {
    if (!this.clinicForm.valid) {
      this.showToast("Warning", "Form is invalid!", "Warning");
      return;
    }

    const formValue = this.clinicForm.value;
    const fullAddress = `${formValue.area}, ${formValue.city}, ${formValue.state}, ${formValue.pincode}`;

    try {
      // Fetch latitude and longitude
      const { lat, lng } = await this.getLatLng(fullAddress);
      console.log('Latitude:', lat, 'Longitude:', lng); // for quick checking

      // Prepare data to save
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
        lat: lat,
        lng: lng,
        status: "Active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docID = uuidv4();
      await this.firebaseService.addInformation(docID, clinicData, "veterinaryClinic");

      this.clinicForm.reset();
      this.showToast("Success", `Clinic "${formValue.name}" added successfully!`, 'Success');
      console.log('Clinic Data saved:', clinicData);

    } catch (error: any) {
      console.error('Error fetching location or saving clinic:', error);
      this.showToast("Error", `Failed to add clinic. ${error.message}`, "Error");
    }
  }
}
