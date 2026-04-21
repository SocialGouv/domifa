import { Component } from "@angular/core";

import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DateFrDirective } from "./date-fr.directive";

@Component({
  template: ` <input type="text" name="dateNaissance" dateFr /> `,
})
class TestHoverFocusComponent {
  public value = "20/12/1991";
}

describe("Directive: Date FR", () => {
  let fixture: ComponentFixture<TestHoverFocusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestHoverFocusComponent, DateFrDirective],
    });

    fixture = TestBed.createComponent(TestHoverFocusComponent);
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
