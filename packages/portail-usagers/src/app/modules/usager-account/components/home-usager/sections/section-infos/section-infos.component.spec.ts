import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SectionInfosComponent } from "./section-infos.component";
import { DEFAULT_USAGER } from "../../../../../../../_common";

describe("SectionInfosComponent", () => {
  let component: SectionInfosComponent;
  let fixture: ComponentFixture<SectionInfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionInfosComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionInfosComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("usager", DEFAULT_USAGER);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
