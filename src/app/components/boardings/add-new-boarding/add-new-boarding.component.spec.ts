import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewBoardingComponent } from './add-new-boarding.component';

describe('AddNewBoardingComponent', () => {
  let component: AddNewBoardingComponent;
  let fixture: ComponentFixture<AddNewBoardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewBoardingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewBoardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
