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

describe("DecisionComponent", () => {
  let fixture: ComponentFixture<DecisionComponent>;
  let component: DecisionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DecisionComponent],
      imports: [
        MatomoModule,
        RouterTestingModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        ToastrModule.forRoot(),
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
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
