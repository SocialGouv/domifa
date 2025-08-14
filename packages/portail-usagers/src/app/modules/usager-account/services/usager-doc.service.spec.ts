import { TestBed } from "@angular/core/testing";

import { UsagerDocService } from "./usager-doc.service";
import { provideHttpClient } from "@angular/common/http";

describe("UsagerDocService", () => {
  let service: UsagerDocService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(UsagerDocService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
