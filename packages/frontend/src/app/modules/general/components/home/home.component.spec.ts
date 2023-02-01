import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { HomeComponent } from "./home.component";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { CommonModule, APP_BASE_HREF } from "@angular/common";

import { SharedModule } from "../../../../modules/shared/shared.module";

import { CountUpModule } from "ngx-countup";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { MATOMO_INJECTORS } from "../../../../shared";

describe("HomeComponent", () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [
        CommonModule,
        SharedModule,
        RouterTestingModule,
        CountUpModule,
        HttpClientTestingModule,
        ...MATOMO_INJECTORS,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],

      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
