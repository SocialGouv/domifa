import { ToastrModule } from "ngx-toastr";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { UsagerAuthService } from "./usager-auth.service";

describe("UsagerAuthService", () => {
  let service: UsagerAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ToastrModule.forRoot(),
      ],
      providers: [UsagerAuthService],
    });
    service = TestBed.inject(UsagerAuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
