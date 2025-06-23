import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageVeterinaryClinicsComponent } from './manage-veterinary-clinics.component';

describe('ManageVeterinaryClinicsComponent', () => {
  let component: ManageVeterinaryClinicsComponent;
  let fixture: ComponentFixture<ManageVeterinaryClinicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageVeterinaryClinicsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageVeterinaryClinicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
