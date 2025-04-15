import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NationalStatsComponent } from "./national-stats.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterModule } from "@angular/router";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { MATOMO_INJECTORS } from "../../../../shared";

describe("NationalStatsComponent", () => {
  let component: NationalStatsComponent;
  let fixture: ComponentFixture<NationalStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NationalStatsComponent],
      imports: [MATOMO_INJECTORS, RouterModule, HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(NationalStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
