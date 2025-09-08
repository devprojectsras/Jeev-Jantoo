import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewFeedingComponent } from './add-new-feeding.component';

describe('AddNewFeedingComponent', () => {
  let component: AddNewFeedingComponent;
  let fixture: ComponentFixture<AddNewFeedingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewFeedingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewFeedingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
