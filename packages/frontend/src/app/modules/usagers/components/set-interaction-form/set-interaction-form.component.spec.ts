import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SetInteractionFormComponent } from "./set-interaction-form.component";

describe("SetInteractionFormComponent", () => {
  let component: SetInteractionFormComponent;
  let fixture: ComponentFixture<SetInteractionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetInteractionFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetInteractionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
