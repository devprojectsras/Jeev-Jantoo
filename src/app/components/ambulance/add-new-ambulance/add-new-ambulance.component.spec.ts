import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewAmbulanceComponent } from './add-new-ambulance.component';

describe('AddNewAmbulanceComponent', () => {
  let component: AddNewAmbulanceComponent;
  let fixture: ComponentFixture<AddNewAmbulanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewAmbulanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewAmbulanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
