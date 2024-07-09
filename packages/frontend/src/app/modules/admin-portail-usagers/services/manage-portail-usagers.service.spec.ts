import { TestBed } from "@angular/core/testing";

import { ManagePortailUsagersService } from "./manage-portail-usagers.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ManagePortailUsagersService", () => {
  let service: ManagePortailUsagersService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ManagePortailUsagersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
