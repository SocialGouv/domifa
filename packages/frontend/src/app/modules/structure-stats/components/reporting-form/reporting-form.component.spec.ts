import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ReportingFormComponent } from "./reporting-form.component";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { _usagerReducer, MATOMO_INJECTORS } from "../../../../shared";
import { StoreModule } from "@ngrx/store";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("ReportingFormComponent", () => {
  let component: ReportingFormComponent;
  let fixture: ComponentFixture<ReportingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportingFormComponent],
      imports: [
        RouterModule.forRoot([]),
        NgbModule,
        FormsModule,
        ...MATOMO_INJECTORS,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
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
