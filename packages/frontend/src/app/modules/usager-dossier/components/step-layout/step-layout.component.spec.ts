import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepLayoutComponent } from './step-layout.component';

describe('StepLayoutComponent', () => {
  let component: StepLayoutComponent;
  let fixture: ComponentFixture<StepLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
