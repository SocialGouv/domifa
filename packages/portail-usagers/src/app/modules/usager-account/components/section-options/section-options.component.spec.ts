import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionOptionsComponent } from './section-options.component';

describe('SectionOptionsComponent', () => {
  let component: SectionOptionsComponent;
  let fixture: ComponentFixture<SectionOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SectionOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
