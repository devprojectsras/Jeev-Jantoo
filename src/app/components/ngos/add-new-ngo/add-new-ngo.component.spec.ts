import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewNgoComponent } from './add-new-ngo.component';

describe('AddNewNgoComponent', () => {
  let component: AddNewNgoComponent;
  let fixture: ComponentFixture<AddNewNgoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewNgoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewNgoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
