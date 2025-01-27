import { TestBed } from "@angular/core/testing";

import { ManageUsersService } from "./manage-users.service";
import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

describe("ManageUsersService", () => {
  let service: ManageUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CommonModule],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    service = TestBed.inject(ManageUsersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
