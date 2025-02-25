import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SectionInfosComponent } from "./section-infos.component";
import { SharedModule } from "../../../../../shared/shared.module";
import { FormatInternationalPhoneNumberPipe } from "../../../../pipes";
import { DEFAULT_USAGER } from "../../../../../../../_common";

describe("SectionInfosComponent", () => {
  let component: SectionInfosComponent;
  let fixture: ComponentFixture<SectionInfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, FormatInternationalPhoneNumberPipe],
      declarations: [SectionInfosComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionInfosComponent);
    component = fixture.componentInstance;
    component.usager = DEFAULT_USAGER;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
