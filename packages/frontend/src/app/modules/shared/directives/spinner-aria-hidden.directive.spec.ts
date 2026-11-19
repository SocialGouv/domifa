import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { SpinnerAriaHiddenDirective } from "./spinner-aria-hidden.directive";

@Component({
  template: `<dsfr-ext-spinner
    appSpinnerAriaHidden
    [typeLoader]="typeLoader"
    label="Chargement en cours"
  ></dsfr-ext-spinner>`,
  imports: [DsfrSpinnerComponent, SpinnerAriaHiddenDirective],
})
class HostComponent {
  public typeLoader: "quarter" | "sun" = "quarter";
}

describe("SpinnerAriaHiddenDirective", () => {
  it("hides the spinner svg but keeps its label", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;

    const svg = host.querySelector("dsfr-ext-spinner svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(host.querySelector("dsfr-ext-spinner")?.textContent).toContain(
      "Chargement en cours"
    );
    expect(
      host.querySelector('dsfr-ext-spinner [aria-hidden="true"] span')
    ).toBeNull();
  });

  it("hides the new svg when the loader type changes", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    fixture.componentInstance.typeLoader = "sun";
    fixture.detectChanges();

    const svgs = (fixture.nativeElement as HTMLElement).querySelectorAll(
      "dsfr-ext-spinner svg"
    );
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((svg) => expect(svg.getAttribute("aria-hidden")).toBe("true"));
  });
});
