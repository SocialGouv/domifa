import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";

import { Interaction, PageOptions, PageResults } from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class InteractionService {
  public endPoint = environment.apiUrl + "portail-usagers/profile/";

  constructor(private readonly http: HttpClient) {}

  public getInteractions(
    pageOptions: PageOptions,
  ): Observable<PageResults<Interaction>> {
    return this.http
      .post<PageResults<Interaction>>(
        `${this.endPoint}interactions/`,
        pageOptions,
      )
      .pipe(
        map((response: PageResults<Interaction>) => {
          response.data = response.data.map(
            (item: Interaction) => new Interaction(item),
          );
          return response;
        }),
      );
  }

  public getPendingInteractions(): Observable<Interaction[]> {
    return this.http.get<Interaction[]>(
      `${this.endPoint}pending-interactions/`,
    );
  }
}
