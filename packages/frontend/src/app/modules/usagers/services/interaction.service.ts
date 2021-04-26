import { InteractionForApi } from "./../../../../_common/model/interaction/InteractionForApi.type";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { UsagerLight } from "../../../../_common/model";
import { InteractionInForm } from "../../../../_common/model/interaction";

import { UsagerFormModel } from "../components/form/UsagerFormModel";
import { Interaction } from "../interfaces/interaction";

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
    return this.http.post<UsagerLight>(
      `${this.endPoint}${usager.ref}`,
      interactions
    );
  }

  public getInteractions(usagerRef: number): Observable<Interaction[]> {
    return this.http.get(`${this.endPoint}${usagerRef}/10`).pipe(
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
