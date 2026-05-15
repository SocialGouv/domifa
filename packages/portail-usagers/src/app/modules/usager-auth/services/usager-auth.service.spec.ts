import { TestBed } from "@angular/core/testing";

import { UsagerAuthService } from "./usager-auth.service";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("UsagerAuthService", () => {
  let service: UsagerAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), UsagerAuthService, provideHttpClient()],
    });
    service = TestBed.inject(UsagerAuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
