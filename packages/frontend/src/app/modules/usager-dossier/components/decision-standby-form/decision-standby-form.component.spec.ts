import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DecisionStandbyFormComponent } from "./decision-standby-form.component";

describe("DecisionStandbyFormComponent", () => {
  let component: DecisionStandbyFormComponent;
  let fixture: ComponentFixture<DecisionStandbyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecisionStandbyFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionStandbyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
