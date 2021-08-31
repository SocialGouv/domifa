import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PublicStatsComponent } from "./public-stats.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

describe("PublicStatsComponent", () => {
  let component: PublicStatsComponent;
  let fixture: ComponentFixture<PublicStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicStatsComponent],
      imports: [
        NgxChartsModule,
        SharedModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
