import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { UsagerNotesService } from "./usager-notes.service";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../shared";

describe("UsagerNotesService", () => {
  let service: UsagerNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ app: _usagerReducer })],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsagerNotesService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
