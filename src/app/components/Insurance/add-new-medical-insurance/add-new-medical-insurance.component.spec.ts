import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewMedicalInsuranceComponent } from './add-new-medical-insurance.component';

describe('AddNewMedicalInsuranceComponent', () => {
  let component: AddNewMedicalInsuranceComponent;
  let fixture: ComponentFixture<AddNewMedicalInsuranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewMedicalInsuranceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewMedicalInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
