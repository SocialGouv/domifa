import { Component, DebugElement, ElementRef, Injectable } from "@angular/core";

import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DateFrDirective } from "./date-fr.directive";

@Component({
  template: ` <input type="text" name="dateNaissance" dateFr /> `,
})
class TestHoverFocusComponent {
  public value: any;
}

describe("Directive: Date FR", () => {
  let component: TestHoverFocusComponent;
  let fixture: ComponentFixture<TestHoverFocusComponent>;
  let inputEl: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestHoverFocusComponent, DateFrDirective],
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
