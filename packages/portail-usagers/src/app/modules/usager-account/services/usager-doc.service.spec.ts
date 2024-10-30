import { TestBed } from "@angular/core/testing";

import { UsagerDocService } from "./usager-doc.service";

describe("UsagerDocService", () => {
  let service: UsagerDocService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsagerDocService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
