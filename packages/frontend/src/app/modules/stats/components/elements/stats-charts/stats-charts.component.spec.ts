import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StatsChartsComponent } from "./stats-charts.component";

describe("StatsChartsComponent", () => {
  let component: StatsChartsComponent;
  let fixture: ComponentFixture<StatsChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatsChartsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
