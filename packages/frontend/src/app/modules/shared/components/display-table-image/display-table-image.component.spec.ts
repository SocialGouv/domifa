import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DisplayTableImageComponent } from "./display-table-image.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgClass } from "@angular/common";
import { DOMIFA_CUSTOM_DOCS } from "../../../structures/constants/DOMIFA_CUSTOM_DOCS.const";

describe("DisplayTableImageComponent", () => {
  let component: DisplayTableImageComponent;
  let fixture: ComponentFixture<DisplayTableImageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FontAwesomeModule, NgClass],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayTableImageComponent);
    component = fixture.componentInstance;
    component.document = DOMIFA_CUSTOM_DOCS[0];
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
