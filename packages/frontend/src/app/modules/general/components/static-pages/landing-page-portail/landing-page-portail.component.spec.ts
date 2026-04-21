import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LandingPagePortailComponent } from "./landing-page-portail.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MATOMO_INJECTORS } from "../../../../../shared";

describe("LandingPagePortailComponent", () => {
  let component: LandingPagePortailComponent;
  let fixture: ComponentFixture<LandingPagePortailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingPagePortailComponent,
        NoopAnimationsModule,
        ...MATOMO_INJECTORS,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPagePortailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
