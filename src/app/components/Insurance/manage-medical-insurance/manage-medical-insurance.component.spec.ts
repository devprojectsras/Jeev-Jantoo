import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMedicalInsuranceComponent } from './manage-medical-insurance.component';

describe('ManageMedicalInsuranceComponent', () => {
  let component: ManageMedicalInsuranceComponent;
  let fixture: ComponentFixture<ManageMedicalInsuranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageMedicalInsuranceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageMedicalInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
