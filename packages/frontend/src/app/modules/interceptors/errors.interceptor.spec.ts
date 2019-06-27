import { APP_BASE_HREF } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HttpErrorInterceptor } from "./errors.interceptor";

describe(`HttpErrorInterceptor`, () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          multi: true,
          provide: HTTP_INTERCEPTORS,
          useClass: HttpErrorInterceptor
        }
      ]
    });

    httpMock = TestBed.get(HttpTestingController);
  });
  it("should be defined", () => {
    expect(httpMock).toBeDefined();
  });
});
