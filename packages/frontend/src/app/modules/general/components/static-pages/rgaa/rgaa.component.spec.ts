import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RgaaComponent } from "./rgaa.component";
import { RouterModule } from "@angular/router";

describe("RgaaComponent", () => {
  let component: RgaaComponent;
  let fixture: ComponentFixture<RgaaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RgaaComponent, RouterModule.forRoot([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RgaaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
