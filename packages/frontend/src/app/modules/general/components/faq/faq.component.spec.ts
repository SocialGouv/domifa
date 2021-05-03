import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FaqComponent } from "./faq.component";
import { ToastrModule } from "ngx-toastr";
import { MatomoInjector, MatomoTracker, MatomoModule } from "ngx-matomo";
import { RouterTestingModule } from "@angular/router/testing";

describe("FaqComponent", () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FaqComponent],
      imports: [
        MatomoModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        ToastrModule.forRoot(),
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
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
