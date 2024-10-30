import { TestBed } from "@angular/core/testing";

import { UsagerDocService } from "./usager-doc.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("UsagerDocService", () => {
  let service: UsagerDocService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(UsagerDocService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
