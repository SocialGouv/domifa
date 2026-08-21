import { TestBed } from "@angular/core/testing";

import { CustomToastService } from "./custom-toast.service";

describe("CustomToastService", () => {
  let service: CustomToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomToastService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
