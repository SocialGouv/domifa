import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayUsagerDocsComponent } from './display-usager-docs.component';

describe('DisplayUsagerDocsComponent', () => {
  let component: DisplayUsagerDocsComponent;
  let fixture: ComponentFixture<DisplayUsagerDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayUsagerDocsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayUsagerDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
