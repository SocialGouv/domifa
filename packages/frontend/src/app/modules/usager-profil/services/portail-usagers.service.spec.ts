import { TestBed } from "@angular/core/testing";

import { PortailUsagersService } from "./portail-usagers.service";

describe("PortailUsagersServiceService", () => {
  let service: PortailUsagersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortailUsagersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
