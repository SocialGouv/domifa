import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { fakeAsync, inject, TestBed } from "@angular/core/testing";
import { AutocompleteAdresseService } from "./autocomplete-adresse";

describe("AutocompleteAdresseService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [AutocompleteAdresseService]
    });
  });
  it("should be created", fakeAsync(
    inject(
      [AutocompleteAdresseService],
      (service: AutocompleteAdresseService) => {
        expect(service).toBeTruthy();
        expect(service.search).toBeDefined();
      }
    )
  ));
});
