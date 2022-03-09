import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { UsagerNotesService } from "./usager-notes.service";

describe("UsagerNotesService", () => {
  let service: UsagerNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(UsagerNotesService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
