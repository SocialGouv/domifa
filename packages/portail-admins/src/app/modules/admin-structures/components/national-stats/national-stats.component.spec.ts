import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NationalStatsComponent } from "./national-stats.component";

describe("NationalStatsComponent", () => {
  let component: NationalStatsComponent;
  let fixture: ComponentFixture<NationalStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NationalStatsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NationalStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
