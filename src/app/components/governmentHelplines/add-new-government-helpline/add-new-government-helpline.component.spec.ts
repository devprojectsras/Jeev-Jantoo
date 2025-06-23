import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewGovernmentHelplineComponent } from './add-new-government-helpline.component';

describe('AddNewGovernmentHelplineComponent', () => {
  let component: AddNewGovernmentHelplineComponent;
  let fixture: ComponentFixture<AddNewGovernmentHelplineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewGovernmentHelplineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewGovernmentHelplineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
