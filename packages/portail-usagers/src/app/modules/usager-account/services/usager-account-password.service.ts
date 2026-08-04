import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class UsagerAccountPasswordService {
  private endPoint = `${environment.apiUrl}portail-usagers/auth`;

  constructor(private readonly http: HttpClient) {}

  public updateMyPassword(data: {
    password: string;
    passwordConfirmation: string;
    oldPassword: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.endPoint}/edit-my-password`,
      data
    );
  }
}
