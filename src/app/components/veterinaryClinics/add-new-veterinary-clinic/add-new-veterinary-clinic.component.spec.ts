import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewVeterinaryClinicComponent } from './add-new-veterinary-clinic.component';

describe('AddNewVeterinaryClinicComponent', () => {
  let component: AddNewVeterinaryClinicComponent;
  let fixture: ComponentFixture<AddNewVeterinaryClinicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewVeterinaryClinicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewVeterinaryClinicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
