import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { ManageUsagersService } from "./manage-usagers.service";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("ManageUsagersService", () => {
  let service: ManageUsagersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        CommonModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [provideHttpClient()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    service = TestBed.inject(ManageUsagersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
