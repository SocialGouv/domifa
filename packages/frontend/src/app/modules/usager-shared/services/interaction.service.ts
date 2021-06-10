import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { UsagerLight } from "../../../../_common/model";
import { InteractionInForm } from "../../../../_common/model/interaction";
import { usagersSearchCache } from "../../../shared/store";
import { UsagerFormModel } from "../../usagers/components/form/UsagerFormModel";
import { Interaction } from "../../usagers/interfaces/interaction";

import { InteractionForApi } from "./../../../../_common/model/interaction/InteractionForApi.type";

@Injectable({
  providedIn: "root",
})
export class InteractionService {
  public endPoint = environment.apiUrl + "interactions/";

  constructor(private http: HttpClient) {}

  public setInteraction(
    usager: UsagerLight | UsagerFormModel,
    interactions: InteractionForApi[]
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(`${this.endPoint}${usager.ref}`, interactions)
      .pipe(
        tap((newUsager: UsagerLight) => {
          usagersSearchCache.updateUsager(newUsager);
        })
      );
  }

  public getInteractions({
    usagerRef,
    maxResults,
    filter,
  }: {
    usagerRef: number;
    maxResults?: number;
    filter?: "distribution";
  }): Observable<Interaction[]> {
    return this.http
      .get(
        `${this.endPoint}${usagerRef}?maxResults=${maxResults}&filter=${filter}`
      )
      .pipe(
        map((response) => {
          return Array.isArray(response)
            ? response.map((item) => new Interaction(item))
            : [new Interaction(response)];
        })
      );
  }

  public delete(usagerRef: number, interactionId: number) {
    return this.http.delete(`${this.endPoint}${usagerRef}/${interactionId}`);
  }

  // Courrier entrant
  public setInteractionIN(
    usager: UsagerLight | UsagerFormModel,
    interaction?: InteractionInForm
  ): Observable<UsagerLight> {
    return this.http
      .post<UsagerLight>(`${this.endPoint}in/${usager.ref}`, interaction)
      .pipe();
  }
}
