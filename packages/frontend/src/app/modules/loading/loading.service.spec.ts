import { async, TestBed } from "@angular/core/testing";
import { LoadingService } from "./loading.service";

describe("LoadingService", () => {
  beforeEach(async(() => TestBed.configureTestingModule({})));

  it("should be created", async(() => {
    const service: LoadingService = TestBed.get(LoadingService);
    expect(service).toBeTruthy();

    service.startLoading();
    expect(service.loading).toBeTruthy();

    service.stopLoading();
    setTimeout(() => {
      expect(service.loading).toBeFalsy();
    }, 1000);
  }));
});
