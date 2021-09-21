import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";
import * as Sentry from "@sentry/browser";
import { ToastrService } from "ngx-toastr";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private endPoint = environment.apiUrl + "auth";

  constructor(
    public http: HttpClient,
    private toastr: ToastrService,
    public router: Router
  ) {}

  public logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("filters");
    // Ajout d'infos pour Sentry
    Sentry.configureScope((scope) => {
      scope.setTag("structure", "none");
      scope.setUser({});
    });

    this.router.navigate(["/connexion"]).then(() => {
      window.location.reload();
    });
  }

  public logoutAndRedirect(state?: RouterStateSnapshot) {
    this.logout();
    if (state) {
      this.router.navigate(["/connexion"], {
        queryParams: { returnUrl: state.url },
      });
    } else {
      this.router.navigate(["/connexion"]);
    }
  }

  public notAuthorized() {
    this.toastr.error(
      "Vous n'êtes pas autorisé à accéder à cette page",
      "Action interdite"
    );
    this.router.navigate(["/"]);
  }
}
