import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

const ADRESSE_DATA_GOUV = "https://api-adresse.data.gouv.fr/search/";
const PARAMS = new HttpParams({
  fromObject: {
    limit: "10"
  }
});

@Injectable({
  providedIn: "root"
})
export class AutocompleteAdresseService {
  public http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  public search(term: string): any {
    if (term === "") {
      return of([]);
    }

    return this.http
      .get(ADRESSE_DATA_GOUV, { params: PARAMS.set("q", term) })
      .pipe(
        map((response: any) => {
          return response.features;
        })
      );
  }
}
