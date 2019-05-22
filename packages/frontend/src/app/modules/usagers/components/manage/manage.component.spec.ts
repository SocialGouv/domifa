import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUsagersComponent } from './manage.component';

describe('ManageUsagersComponent', () => {
  let component: ManageUsagersComponent;
  let fixture: ComponentFixture<ManageUsagersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageUsagersComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUsagersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
