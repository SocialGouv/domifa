import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { LoadingService } from "../../loading/loading.service";

import { InteractionService } from "./interaction.service";

describe("InteractionService", () => {
  let service: InteractionService;

  beforeEach(() => {
    const loadingServiceStub = () => ({});
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        InteractionService,
        { provide: LoadingService, useFactory: loadingServiceStub },
      ],
    });
    service = TestBed.inject(InteractionService);
  });

  it("can load instance", () => {
    expect(service).toBeTruthy();
  });
});
