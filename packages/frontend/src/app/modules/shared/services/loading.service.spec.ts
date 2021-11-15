import { TestBed, waitForAsync } from "@angular/core/testing";
import { LoadingService } from "./loading.service";

describe("LoadingService", () => {
  beforeEach(waitForAsync(() => TestBed.configureTestingModule({})));

  it("should be created", waitForAsync(() => {
    const service: LoadingService = TestBed.inject(LoadingService);
    expect(service).toBeTruthy();

    service.startLoading();
    expect(service.loading).toBeTruthy();

    service.stopLoading();
    setTimeout(() => {
      expect(service.loading).toBeFalsy();
    }, 1000);
  }));
});
