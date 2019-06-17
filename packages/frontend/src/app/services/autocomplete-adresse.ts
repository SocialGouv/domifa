import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { map } from "rxjs/operators";

const ADRESSE_DATA_GOUV = "https://api-adresse.data.gouv.fr/search/";
const PARAMS = new HttpParams({
  fromObject: {
    limit: "10",
    type: "municipality"
  }
});

@Injectable({
  providedIn: "root"
})
export class AutocompleteAdresseService {
  constructor(private http: HttpClient) {}

  public search(term: string) {
    if (term === "") {
      return of([]);
    }

    return this.http
      .get(ADRESSE_DATA_GOUV, { params: PARAMS.set("q", term) })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
}
