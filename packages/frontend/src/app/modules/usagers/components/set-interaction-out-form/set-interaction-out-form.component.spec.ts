import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SetInteractionOutFormComponent } from "./set-interaction-out-form.component";

describe("SetInteractionOutFormComponent", () => {
  let component: SetInteractionOutFormComponent;
  let fixture: ComponentFixture<SetInteractionOutFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetInteractionOutFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetInteractionOutFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
