import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageGovernmentHelplinesComponent } from './manage-government-helplines.component';

describe('ManageGovernmentHelplinesComponent', () => {
  let component: ManageGovernmentHelplinesComponent;
  let fixture: ComponentFixture<ManageGovernmentHelplinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageGovernmentHelplinesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageGovernmentHelplinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
