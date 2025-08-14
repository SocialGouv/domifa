import { TestBed } from "@angular/core/testing";

import { InteractionService } from "./interaction.service";
import { provideHttpClient } from "@angular/common/http";

describe("InteractionService", () => {
  let service: InteractionService;

  beforeEach(() => {
    const loadingServiceStub = () => ({});
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        InteractionService,
        { useFactory: loadingServiceStub },
      ],
    });
    service = TestBed.inject(InteractionService);
  });

  it("can load instance", () => {
    expect(service).toBeTruthy();
  });
});
