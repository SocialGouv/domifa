import { inject, TestBed } from "@angular/core/testing";

import { HttpClientModule } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { RouterTestingModule } from "@angular/router/testing";
import { APP_BASE_HREF } from "@angular/common";
import { RouterModule } from "@angular/router";

describe("AuthService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule, RouterTestingModule],
      providers: [AuthService, { provide: APP_BASE_HREF, useValue: "/" }],
    });
  });

  it("should be created", inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
