import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewSpaComponent } from './add-new-spa.component';

describe('AddNewSpaComponent', () => {
  let component: AddNewSpaComponent;
  let fixture: ComponentFixture<AddNewSpaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewSpaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewSpaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
