import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSmsStatsComponent } from './admin-sms-stats.component';

describe('AdminSmsStatsComponent', () => {
  let component: AdminSmsStatsComponent;
  let fixture: ComponentFixture<AdminSmsStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminSmsStatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSmsStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
