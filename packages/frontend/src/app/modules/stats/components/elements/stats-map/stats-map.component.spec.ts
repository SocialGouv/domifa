import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DEFAULT_PUBLIC_STATS } from "../../../../../../_common/model/stats/DEFAULT_PUBLIC_STATS.const";

import { StatsMapComponent } from "./stats-map.component";

describe("StatsMapComponent", () => {
  let component: StatsMapComponent;
  let fixture: ComponentFixture<StatsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatsMapComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsMapComponent);
    component = fixture.componentInstance;
    component.publicStats = DEFAULT_PUBLIC_STATS;
    component.statsByRegion = [];

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
