import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSpasComponent } from './manage-spas.component';

describe('ManageSpasComponent', () => {
  let component: ManageSpasComponent;
  let fixture: ComponentFixture<ManageSpasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageSpasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSpasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
