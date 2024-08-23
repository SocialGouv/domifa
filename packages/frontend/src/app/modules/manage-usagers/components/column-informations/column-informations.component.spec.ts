import { UsagerFormModel } from "./../../../usager-shared/interfaces/UsagerFormModel";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ColumnInformationsComponent } from "./column-informations.component";
import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { UsagerSharedModule } from "../../../usager-shared/usager-shared.module";

describe("ColumnInformationsComponent", () => {
  let component: ColumnInformationsComponent;
  let fixture: ComponentFixture<ColumnInformationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ColumnInformationsComponent],
      imports: [NgbModule, UsagerSharedModule],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
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
