import { CommonModule } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { SharedModule } from "../shared/shared.module";

import { ImportUsagersService } from "./import-usagers.service";

describe("ImportUsagersService", () => {
  let service: ImportUsagersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CommonModule,
        SharedModule,
        RouterTestingModule,
      ],
    });
    service = TestBed.inject(ImportUsagersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
