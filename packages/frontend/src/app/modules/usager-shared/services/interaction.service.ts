import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import {
  InteractionInForApi,
  InteractionOutForApi,
  UsagerLight,
} from "../../../../_common/model";

import { Store } from "@ngrx/store";
import { usagerActions, UsagerState } from "../../../shared";
import {
  Interaction,
  PageOptions,
  PageResults,
  UserUsagerLogin,
} from "@domifa/common";

@Injectable({
  providedIn: "root",
})
export class InteractionService {
  public endPoint = environment.apiUrl + "interactions/";

  constructor(
    private readonly http: HttpClient,
    private readonly store: Store<UsagerState>
  ) {}

  public setInteraction(
    usagerRef: number,
    interactions: InteractionInForApi[] | InteractionOutForApi[]
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(`${this.endPoint}${usagerRef}`, interactions)
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(
            usagerActions.updateUsager({ usager: newUsager })
          );
        })
      );
  }

  public getInteractions(
    usagerRef: number,
    pageOptions: PageOptions
  ): Observable<PageResults<Interaction>> {
    return this.http
      .post<PageResults<Interaction>>(
        `${this.endPoint}search/${usagerRef}`,
        pageOptions
      )
      .pipe(
        map((response: PageResults<Interaction>) => {
          response.data = Array.isArray(response.data)
            ? response.data.map((item: Interaction) => new Interaction(item))
            : [new Interaction(response.data)];
          return response;
        })
      );
  }

  public getLoginPortail(
    usagerRef: number,
    pageOptions: PageOptions
  ): Observable<PageResults<UserUsagerLogin>> {
    return this.http.post<PageResults<UserUsagerLogin>>(
      `${this.endPoint}search-login-portail/${usagerRef}`,
      pageOptions
    );
  }

  public delete(
    usagerRef: number,
    interactionUuid: string
  ): Observable<UsagerLight> {
    return this.http
      .delete<UsagerLight>(`${this.endPoint}${usagerRef}/${interactionUuid}`)
      .pipe(
        tap((newUsager: UsagerLight) => {
          this.store.dispatch(
            usagerActions.updateUsager({ usager: newUsager })
          );
          return newUsager;
        })
      );
  }
}
