import { fakeAsync, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { LoadingService } from "./loading.service";
import {
  DEFAULT_LOADING_LABEL,
  UPLOAD_LOADING_LABELS,
} from "./loading.constants";

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

  it("updates the label and resets it when loading stops", fakeAsync(() => {
    const service: LoadingService = TestBed.inject(LoadingService);

    service.startLoading(UPLOAD_LOADING_LABELS.UPLOADING);
    expect(service.loadingLabel.value).toBe(UPLOAD_LOADING_LABELS.UPLOADING);

    service.setLabel(UPLOAD_LOADING_LABELS.SCANNING);
    expect(service.loadingLabel.value).toBe(UPLOAD_LOADING_LABELS.SCANNING);

    service.stopLoading();
    tick(200);
    expect(service.loadingLabel.value).toBe(DEFAULT_LOADING_LABEL);
  }));
});
