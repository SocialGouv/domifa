import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoModule, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "../../../../../shared/shared.module";
import { DecisionComponent } from "./decision.component";

describe("DecisionComponent", () => {
  let fixture: ComponentFixture<DecisionComponent>;
  let component: DecisionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DecisionComponent],
      imports: [
        SharedModule,
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
