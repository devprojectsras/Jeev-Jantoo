import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAbcsComponent } from './manage-abcs.component';

describe('ManageAbcsComponent', () => {
  let component: ManageAbcsComponent;
  let fixture: ComponentFixture<ManageAbcsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAbcsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAbcsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
