import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DecisionDeleteFormComponent } from "./decision-delete-form.component";

describe("DecisionDeleteFormComponent", () => {
  let component: DecisionDeleteFormComponent;
  let fixture: ComponentFixture<DecisionDeleteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecisionDeleteFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionDeleteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
