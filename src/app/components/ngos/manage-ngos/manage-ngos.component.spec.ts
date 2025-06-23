import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNgosComponent } from './manage-ngos.component';

describe('ManageNgosComponent', () => {
  let component: ManageNgosComponent;
  let fixture: ComponentFixture<ManageNgosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageNgosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageNgosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
