import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SetInteractionInFormComponent } from "./set-interaction-in-form.component";

describe("SetInteractionInFormComponent", () => {
  let component: SetInteractionInFormComponent;
  let fixture: ComponentFixture<SetInteractionInFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetInteractionInFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetInteractionInFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
