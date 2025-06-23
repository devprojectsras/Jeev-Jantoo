import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBoardingsComponent } from './manage-boardings.component';

describe('ManageBoardingsComponent', () => {
  let component: ManageBoardingsComponent;
  let fixture: ComponentFixture<ManageBoardingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBoardingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBoardingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
