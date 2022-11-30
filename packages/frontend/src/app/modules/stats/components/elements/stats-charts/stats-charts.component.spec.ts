import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StatsChartsComponent } from "./stats-charts.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { NgxChartsModule } from "@swimlane/ngx-charts";

import { DEFAULT_PUBLIC_STATS } from "../../../../../../_common/model/stats/DEFAULT_PUBLIC_STATS.const";
import { SharedModule } from "../../../../shared/shared.module";

describe("StatsChartsComponent", () => {
  let component: StatsChartsComponent;
  let fixture: ComponentFixture<StatsChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatsChartsComponent],
      imports: [
        NgxChartsModule,
        SharedModule,

        RouterTestingModule,
        HttpClientTestingModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsChartsComponent);
    component = fixture.componentInstance;
    component.publicStats = DEFAULT_PUBLIC_STATS;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
