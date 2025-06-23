import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewPetAdoptionComponent } from './add-new-pet-adoption.component';

describe('AddNewPetAdoptionComponent', () => {
  let component: AddNewPetAdoptionComponent;
  let fixture: ComponentFixture<AddNewPetAdoptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewPetAdoptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewPetAdoptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});