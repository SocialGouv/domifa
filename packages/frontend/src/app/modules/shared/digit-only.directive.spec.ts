import { Component, DebugElement, ElementRef, Injectable } from "@angular/core";

import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DigitOnlyDirective } from "./digit-only.directive";

@Component({
  // eslint-disable-next-line quotes
  template: ' <input type="text" name="chips" digitOnly /> ',
})
class TestHoverFocusComponent {
  public value: any;
}

describe("Directive: Digit Only", () => {
  let component: TestHoverFocusComponent;
  let fixture: ComponentFixture<TestHoverFocusComponent>;
  let inputEl: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestHoverFocusComponent, DigitOnlyDirective],
    });

    fixture = TestBed.createComponent(TestHoverFocusComponent);

    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css("input"));
  }));

  it("should be created", fakeAsync(() => {
    const numberDebug = fixture.debugElement.query(By.css("input"));
    const numberInput = numberDebug.nativeElement as HTMLInputElement;
    numberDebug.triggerEventHandler("keydown", { bubbles: true, key: 2 });
    tick();

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(numberInput.value).toEqual("");
    });
  }));
});
