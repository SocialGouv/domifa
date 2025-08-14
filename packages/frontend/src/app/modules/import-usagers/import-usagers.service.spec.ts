import { CommonModule } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { SharedModule } from "../shared/shared.module";

import { ImportUsagersService } from "./import-usagers.service";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("ImportUsagersService", () => {
  let service: ImportUsagersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), CommonModule, SharedModule],
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(ImportUsagersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
