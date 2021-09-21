import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsagerLoginComponent } from './usager-login.component';

describe('UsagerLoginComponent', () => {
  let component: UsagerLoginComponent;
  let fixture: ComponentFixture<UsagerLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsagerLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsagerLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
