import { TestBed } from "@angular/core/testing";

import { ManagePortailUsagersService } from "./manage-portail-usagers.service";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

describe("ManagePortailUsagersService", () => {
  let service: ManagePortailUsagersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ManagePortailUsagersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
