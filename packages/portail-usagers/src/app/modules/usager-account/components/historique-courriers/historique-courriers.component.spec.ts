import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HistoriqueCourriersComponent } from "./historique-courriers.component";

describe("HistoriqueCourriersComponent", () => {
  let component: HistoriqueCourriersComponent;
  let fixture: ComponentFixture<HistoriqueCourriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoriqueCourriersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoriqueCourriersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
