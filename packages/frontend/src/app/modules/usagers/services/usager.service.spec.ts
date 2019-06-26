import { TestBed } from "@angular/core/testing";

import { HttpClientModule } from "@angular/common/http";
import { Usager } from "../interfaces/usager";
import { UsagerService } from "./usager.service";

describe("UsagerService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [UsagerService]
    });
  });

  it("should be created", () => {
    const service: UsagerService = TestBed.get(UsagerService);
    expect(service).toBeTruthy();
  });

  it("CREATE USAGER", () => {
    const usager = new Usager({});
    expect(usager).toBeDefined();
  });
});
