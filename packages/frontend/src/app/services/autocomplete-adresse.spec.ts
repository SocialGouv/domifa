import { HttpClientModule } from "@angular/common/http";
import { async, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { AutocompleteAdresseService } from "./autocomplete-adresse";

describe("AutocompleteAdresseService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [AutocompleteAdresseService]
    });
  });

  it("🔍 Adresse Data Gouv Autocomplete", async(() => {
    const service: AutocompleteAdresseService = TestBed.get(
      AutocompleteAdresseService
    );
    expect(service).toBeTruthy();

    service.search("110 route de saint-leu").subscribe((value: any) => {
      expect(value.length).toEqual(10);
    });

    service.search("").subscribe((value: any) => {
      expect(value.length).toEqual(0);
    });
  }));
});
