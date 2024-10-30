import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SectionDocsComponent } from "./section-docs.component";
import { DEFAULT_USAGER } from "../../../../../../../_common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared.module";

describe("SectionDocsComponent", () => {
  let component: SectionDocsComponent;
  let fixture: ComponentFixture<SectionDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SectionDocsComponent],
      imports: [SharedModule, HttpClientTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionDocsComponent);
    component = fixture.componentInstance;
    component.usager = DEFAULT_USAGER;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
