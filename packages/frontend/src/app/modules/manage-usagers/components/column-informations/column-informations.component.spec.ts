import { UsagerFormModel } from "./../../../usager-shared/interfaces/UsagerFormModel";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ColumnInformationsComponent } from "./column-informations.component";
import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks";
import { APP_BASE_HREF, registerLocaleData } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from "@angular/core";
import localeFr from "@angular/common/locales/fr";

import { UsagerSharedModule } from "../../../usager-shared/usager-shared.module";

registerLocaleData(localeFr);

describe("ColumnInformationsComponent", () => {
  let component: ColumnInformationsComponent;
  let fixture: ComponentFixture<ColumnInformationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnInformationsComponent, UsagerSharedModule],
      providers: [
        { provide: APP_BASE_HREF, useValue: "/" },
        { provide: LOCALE_ID, useValue: "fr-FR" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnInformationsComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
