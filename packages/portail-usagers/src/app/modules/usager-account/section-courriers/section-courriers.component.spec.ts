import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionCourriersComponent } from './section-courriers.component';

describe('SectionCourriersComponent', () => {
  let component: SectionCourriersComponent;
  let fixture: ComponentFixture<SectionCourriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SectionCourriersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionCourriersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
