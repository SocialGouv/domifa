import { TestBed } from "@angular/core/testing";

import { PortailUsagersService } from "./portail-usagers.service";
import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../shared";
import { UsagerService } from "../../usager-shared/services";

describe("PortailUsagersService", () => {
  let service: PortailUsagersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CommonModule,
        RouterTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [UsagerService, { provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    service = TestBed.inject(PortailUsagersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
