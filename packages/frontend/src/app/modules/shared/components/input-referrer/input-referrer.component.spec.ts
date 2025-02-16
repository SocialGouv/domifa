import { ComponentFixture, TestBed } from "@angular/core/testing";

import { InputReferrerComponent } from "./input-referrer.component";

describe("InputReferrerComponent", () => {
  let component: InputReferrerComponent;
  let fixture: ComponentFixture<InputReferrerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputReferrerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputReferrerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
