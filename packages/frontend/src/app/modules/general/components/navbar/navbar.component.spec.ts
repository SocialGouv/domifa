import { CommonModule, APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { RouterTestingModule } from "@angular/router/testing";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { MatomoInjector, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "../../../shared/shared.module";

import { NavbarComponent } from "./navbar.component";

describe("NavbarComponent", () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [NavbarComponent],
        imports: [
          CommonModule,
          SharedModule,
          FontAwesomeModule,
          RouterTestingModule,
          ToastrModule.forRoot(),
          HttpClientTestingModule,
        ],
        providers: [
          { provide: APP_BASE_HREF, useValue: "/" },
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
        ],

        schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
