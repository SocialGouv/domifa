import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DisplayContactDetailsDecisionComponent } from "./display-contact-details-decision.component";
import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { FormatInternationalPhoneNumberPipe } from "../../../usager-shared/formatInternationalPhoneNumber.pipe";

describe("DisplayContactDetailsDecisionComponent", () => {
  let component: DisplayContactDetailsDecisionComponent;
  let fixture: ComponentFixture<DisplayContactDetailsDecisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisplayContactDetailsDecisionComponent],
      imports: [FormatInternationalPhoneNumberPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayContactDetailsDecisionComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
