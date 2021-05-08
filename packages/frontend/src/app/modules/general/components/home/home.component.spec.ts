import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { HomeComponent } from "./home.component";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { CommonModule, APP_BASE_HREF } from "@angular/common";

import { SharedModule } from "src/app/modules/shared/shared.module";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CountUpModule } from "ngx-countup";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { MatomoInjector, MatomoTracker } from "ngx-matomo";

describe("HomeComponent", () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HomeComponent],
        imports: [
          CommonModule,
          SharedModule,
          FontAwesomeModule,
          RouterTestingModule,
          CountUpModule,
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
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
