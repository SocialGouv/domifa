import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ReportingFormComponent } from "./reporting-form.component";
import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MATOMO_INJECTORS } from "../../../../shared";
import { StructuresModule } from "../../../structures/structures.module";

describe("ReportingFormComponent", () => {
  let component: ReportingFormComponent;
  let fixture: ComponentFixture<ReportingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportingFormComponent],
      imports: [
        StructuresModule,
        HttpClientTestingModule,
        NgbModule,
        FormsModule,
        RouterTestingModule,
        ...MATOMO_INJECTORS,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportingFormComponent);
    component = fixture.componentInstance;
    component.currentReport = {
      waitingList: null,
      waitingTime: null,
      workers: null,
      volunteers: null,
      humanCosts: null,
      totalCosts: null,
      year: 2023,
      structureId: 1,
      confirmationDate: null,
      completedBy: null,
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
