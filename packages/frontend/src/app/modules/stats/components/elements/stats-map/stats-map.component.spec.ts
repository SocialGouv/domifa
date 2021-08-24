import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StatsMapComponent } from "./stats-map.component";

describe("StatsMapComponent", () => {
  let component: StatsMapComponent;
  let fixture: ComponentFixture<StatsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatsMapComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
