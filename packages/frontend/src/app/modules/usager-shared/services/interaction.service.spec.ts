import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { LoadingService } from "../../shared/services/loading.service";

import { InteractionService } from "./interaction.service";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../shared";

describe("InteractionService", () => {
  let service: InteractionService;

  beforeEach(() => {
    const loadingServiceStub = () => ({});
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ app: _usagerReducer })],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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
