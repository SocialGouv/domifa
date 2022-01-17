import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ToastrModule } from "ngx-toastr";

import { AdminSmsStatsComponent } from "./admin-sms-stats.component";

describe("AdminSmsStatsComponent", () => {
  let component: AdminSmsStatsComponent;
  let fixture: ComponentFixture<AdminSmsStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminSmsStatsComponent],
      imports: [
        RouterTestingModule,
        ToastrModule.forRoot(),
        HttpClientTestingModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSmsStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
