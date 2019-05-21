import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsagersFormComponent } from './usagers-form';

describe('UsagersFormComponent', () => {
  let component: UsagersFormComponent;
  let fixture: ComponentFixture<UsagersFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UsagersFormComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsagersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
