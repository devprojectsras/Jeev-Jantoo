import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFeedingComponent } from './manage-feeding.component';

describe('ManageFeedingComponent', () => {
  let component: ManageFeedingComponent;
  let fixture: ComponentFixture<ManageFeedingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFeedingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFeedingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
