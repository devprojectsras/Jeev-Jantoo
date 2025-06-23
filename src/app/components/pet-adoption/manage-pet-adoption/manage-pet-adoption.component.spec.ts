import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManageAdoptionComponent } from './manage-adoption.component';

describe('ManageAdoptionComponent', () => {
  let component: ManageAdoptionComponent;
  let fixture: ComponentFixture<ManageAdoptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        ManageAdoptionComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageAdoptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the edit form', () => {
    expect(component.editAdoptionForm).toBeDefined();
    expect(component.editAdoptionForm.get('petName')).toBeTruthy();
    expect(component.editAdoptionForm.get('petType')).toBeTruthy();
    expect(component.editAdoptionForm.get('age')).toBeTruthy();
    expect(component.editAdoptionForm.get('description')).toBeTruthy();
  });
});