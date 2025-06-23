import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAmbulanceComponent } from './manage-ambulance.component';

describe('ManageAmbulanceComponent', () => {
  let component: ManageAmbulanceComponent;
  let fixture: ComponentFixture<ManageAmbulanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAmbulanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAmbulanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
