import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { StatsMapComponent } from "./stats-map.component";
import { PublicStats } from "@domifa/common";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("StatsMapComponent", () => {
  let component: StatsMapComponent;
  let fixture: ComponentFixture<StatsMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StatsMapComponent],
      imports: [RouterModule.forRoot([])],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],

      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsMapComponent);
    component = fixture.componentInstance;
    component.publicStats = new PublicStats();
    component.statsRegionsValues = {};
    component.selectedRegion = null;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
