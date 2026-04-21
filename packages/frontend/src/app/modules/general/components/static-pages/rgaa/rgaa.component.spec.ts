import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RgaaComponent } from "./rgaa.component";

describe("RgaaComponent", () => {
  let component: RgaaComponent;
  let fixture: ComponentFixture<RgaaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RgaaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RgaaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
