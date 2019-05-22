import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UsagersFormComponent } from './usagers-form';

describe('UsagersFormComponent', () => {
  let component: UsagersFormComponent;
  let fixture: ComponentFixture<UsagersFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UsagersFormComponent],
      imports:[NgbModule.forRoot(),ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsagersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
