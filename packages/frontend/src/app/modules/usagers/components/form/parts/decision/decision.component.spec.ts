import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { UsagersModule } from "../../../../usagers.module";
import { MatomoInjector, MatomoModule, MatomoTracker } from "ngx-matomo";
import { DecisionComponent } from "./decision.component";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { routes } from "../../../../../../app-routing.module";
import { GeneralModule } from "../../../../../general/general.module";
import { StatsModule } from "../../../../../stats/stats.module";
import { StructuresModule } from "../../../../../structures/structures.module";

describe("DecisionComponent", () => {
  let fixture: ComponentFixture<DecisionComponent>;
  let app: DecisionComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        MatomoModule,
        GeneralModule,
        UsagersModule,
        StatsModule,
        StructuresModule,
        RouterTestingModule.withRoutes(routes),
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        ToastrModule.forRoot(),
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: MatomoInjector,
          useValue: {
            init: jest.fn(),
          },
        },
        {
          provide: MatomoTracker,
          useValue: {
            setUserId: jest.fn(),
          },
        },
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(DecisionComponent);

    app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(app).toBeTruthy();
  });
});
