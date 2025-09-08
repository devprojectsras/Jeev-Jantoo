import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewFoodComponent } from './add-new-food.component';

describe('AddNewFoodComponent', () => {
  let component: AddNewFoodComponent;
  let fixture: ComponentFixture<AddNewFoodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewFoodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewFoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
