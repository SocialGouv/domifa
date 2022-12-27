import { MatomoModule } from "ngx-matomo";
import { CommonModule, APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { RouterTestingModule } from "@angular/router/testing";

import { SharedModule } from "../../../shared/shared.module";

import { NavbarComponent } from "./navbar.component";
import { MATOMO_INJECTOR_FOR_TESTS } from "../../../../../_common/mocks";

describe("NavbarComponent", () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [
        CommonModule,
        SharedModule,
        RouterTestingModule,
        HttpClientTestingModule,
        MatomoModule.forRoot(MATOMO_INJECTOR_FOR_TESTS),
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
