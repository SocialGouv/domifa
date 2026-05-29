import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { BrevoBlockedContact } from "@domifa/common";

import { environment } from "../../../../environments/environment";

export interface BrevoBlocklistPage {
  data: BrevoBlockedContact[];
  total: number | null;
}

@Injectable({ providedIn: "root" })
export class BrevoBlocklistService {
  private readonly endPoint = environment.apiUrl + "admin/users";

  constructor(private readonly http: HttpClient) {}

  public list(page: number, take: number): Observable<BrevoBlocklistPage> {
    const params = new HttpParams().set("page", page).set("take", take);
    return this.http.get<BrevoBlocklistPage>(
      `${this.endPoint}/brevo/blocked-contacts`,
      { params }
    );
  }

  public unblock(email: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.endPoint}/brevo/blocked-contacts/${encodeURIComponent(email)}`
    );
  }

  public resolveBrevoContactUrl(
    email: string
  ): Observable<{ url: string | null }> {
    const params = new HttpParams().set("email", email);
    return this.http.get<{ url: string | null }>(
      `${this.endPoint}/brevo/contact-link`,
      { params }
    );
  }
}
