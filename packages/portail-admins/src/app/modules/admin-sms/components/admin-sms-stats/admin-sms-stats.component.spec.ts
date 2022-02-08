import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ToastrModule } from "ngx-toastr";

import { AdminSmsStatsComponent } from "./admin-sms-stats.component";
import { AdminSmsApiClient } from "../../admin-sms-api-client.service";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";

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
      providers: [AdminSmsApiClient],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
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
