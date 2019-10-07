import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { DecisionComponent } from "./decision.component";

describe("DecisionComponent", () => {
  let component: DecisionComponent;
  let fixture: ComponentFixture<DecisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DecisionComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
