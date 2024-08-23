import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DisplayContactDetailsComponent } from "./display-contact-details.component";
import {
  USAGER_VALIDE_MOCK,
  USER_STRUCTURE_MOCK,
} from "../../../../../../_common/mocks";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { NgxIntlTelInputModule } from "@khazii/ngx-intl-tel-input";
import { FormatInternationalPhoneNumberPipe } from "../../../../usager-shared/formatInternationalPhoneNumber.pipe";

describe("DisplayContactDetailsComponent", () => {
  let component: DisplayContactDetailsComponent;
  let fixture: ComponentFixture<DisplayContactDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisplayContactDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormatInternationalPhoneNumberPipe, NgxIntlTelInputModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayContactDetailsComponent);
    component = fixture.componentInstance;
    component.me = USER_STRUCTURE_MOCK;
    component.me.structure = USER_STRUCTURE_MOCK.structure;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
