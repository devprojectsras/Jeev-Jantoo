import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewAbcComponent } from './add-new-abc.component';

describe('AddNewAbcComponent', () => {
  let component: AddNewAbcComponent;
  let fixture: ComponentFixture<AddNewAbcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewAbcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewAbcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
