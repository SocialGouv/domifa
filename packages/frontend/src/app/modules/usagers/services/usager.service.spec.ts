import { TestBed } from "@angular/core/testing";

import { HttpClientModule } from "@angular/common/http";
import { Entretien } from "../interfaces/entretien";
import { Rdv } from "../interfaces/rdv";
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

  it("Interfaces", () => {
    const usager = new Usager({});
    const entretien = new Entretien({});
    const rdv = new Rdv({});

    expect(usager).toBeDefined();
    expect(entretien).toBeDefined();
    expect(rdv).toBeDefined();
  });
});
