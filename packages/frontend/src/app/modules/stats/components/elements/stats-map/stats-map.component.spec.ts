import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { DEFAULT_PUBLIC_STATS } from "../../../../../../_common/model/stats/DEFAULT_PUBLIC_STATS.const";

import { StatsMapComponent } from "./stats-map.component";

describe("StatsMapComponent", () => {
  let component: StatsMapComponent;
  let fixture: ComponentFixture<StatsMapComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StatsMapComponent],
        imports: [
          BrowserAnimationsModule,
          HttpClientTestingModule,
          RouterTestingModule,
        ],
        providers: [{ provide: APP_BASE_HREF, useValue: "/" }],

        schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsMapComponent);
    component = fixture.componentInstance;
    component.publicStats = DEFAULT_PUBLIC_STATS;
    component.statsRegionsValues = {};
    component.selectedRegion = null;
    component.statsByRegion = [];

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
