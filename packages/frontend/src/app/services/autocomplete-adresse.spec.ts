import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, TestBed } from "@angular/core/testing";
import { AutocompleteAdresseService } from "./autocomplete-adresse";

describe("AutocompleteAdresseService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [AutocompleteAdresseService]
    });
  });

  it("Get Search", async(() => {
    const service: AutocompleteAdresseService = TestBed.get(
      AutocompleteAdresseService
    );

    // expect(service).toBeTruthy();
    console.log(service.search(""));
    console.log(service.search("110 route de saint-leu"));

    service.search("110 route de saint-leu").subscribe(
      (adresses: any) => {
        expect(adresses).toBeTruthy();
        console.log("adresses");
        console.log(adresses);
      },
      error => {
        expect(error).toBeTruthy();
        console.log("ERRORS");
        console.log(error);
        // expect(error).toBeTruthy();
      }
    );
  }));
});
