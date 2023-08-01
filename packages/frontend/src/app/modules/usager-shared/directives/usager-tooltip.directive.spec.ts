import { TestBed, ComponentFixture } from "@angular/core/testing";
import { Component, ViewChild } from "@angular/core";
import { NgbModule, NgbTooltip } from "@ng-bootstrap/ng-bootstrap";
import { TooltipControlService } from "../services";
import { TooltipDirective } from "./usager-tooltip.directive";

@Component({
  template: `<button
      type="button"
      id="first"
      triggers="manual"
      [autoClose]="false"
      [ngbTooltip]="firstTooltip"
      [appTooltip]="tooltipOne"
      #tooltipOne="ngbTooltip"
    >
      Test
    </button>
    <ng-template #firstTooltip>
      <p>Message</p>
    </ng-template>
    <button
      type="button"
      id="second"
      triggers="manual"
      [autoClose]="false"
      [ngbTooltip]="secondTooltip"
      [appTooltip]="tooltipTwo"
      #tooltipTwo="ngbTooltip"
    >
      Test
    </button>
    <ng-template #secondTooltip>
      <p>Message</p>
    </ng-template>`,
})
class TestComponent {
  @ViewChild("tooltipTwo") public tooltipTwo!: NgbTooltip;
  @ViewChild("tooltipOne") public tooltipOne!: NgbTooltip;
}

describe("TooltipDirective", () => {
  let fixture: ComponentFixture<TestComponent>;
  let tooltipControlService: TooltipControlService;
  let firstButtonElement: HTMLButtonElement;
  let secondButtonElement: HTMLButtonElement;

  let component: TestComponent;
  let directive: TooltipDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TooltipDirective, TestComponent],
      providers: [TooltipControlService],
      imports: [NgbModule],
    });

    fixture = TestBed.createComponent(TestComponent);
    tooltipControlService = TestBed.inject(TooltipControlService);

    component = fixture.componentInstance;
    fixture.detectChanges();

    firstButtonElement = fixture.nativeElement.querySelector("#first");
    secondButtonElement = fixture.nativeElement.querySelector("#second");
  });

  it("should create an instance", () => {
    directive = new TooltipDirective(tooltipControlService);
    expect(component).toBeTruthy();
    expect(directive).toBeTruthy();
  });

  it("should set hasFocus to true when input receives focus event", () => {
    expect(component.tooltipOne.isOpen()).toBeFalsy();
    firstButtonElement.dispatchEvent(new Event("focus"));
    fixture.detectChanges();
    secondButtonElement.dispatchEvent(new Event("focus"));
    fixture.detectChanges();
    expect(component.tooltipTwo.isOpen()).toBeTruthy();
  });
});
