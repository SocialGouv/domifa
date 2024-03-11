import { USAGER_REFUS_MOCK } from "../../../../../../../_common/mocks/USAGER_REFUS.mock";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SectionOptionsComponent } from "./section-options.component";

describe("SectionOptionsComponent", () => {
  let component: SectionOptionsComponent;
  let fixture: ComponentFixture<SectionOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SectionOptionsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionOptionsComponent);
    component = fixture.componentInstance;
    component.usager = USAGER_REFUS_MOCK;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
