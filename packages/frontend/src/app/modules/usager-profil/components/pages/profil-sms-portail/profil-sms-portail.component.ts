import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { AuthService, CustomToastService } from "../../../../shared/services";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { BaseUsagerProfilPageComponent } from "../base-usager-profil-page/base-usager-profil-page.component";
import { UsagerState } from "../../../../../shared";

@Component({
  selector: "app-profil-sms-portail",
  templateUrl: "./profil-sms-portail.component.html",
  styleUrls: ["./profil-sms-portail.component.css"],
})
export class ProfilSmsPortailComponent extends BaseUsagerProfilPageComponent {
  public editContactDetails = false;
  public section = "sms-portail";
  constructor(
    protected readonly authService: AuthService,
    protected readonly usagerProfilService: UsagerProfilService,
    protected readonly titleService: Title,
    protected readonly toastService: CustomToastService,
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
    protected readonly store: Store<UsagerState>
  ) {
    super(
      authService,
      usagerProfilService,
      titleService,
      toastService,
      route,
      router,
      store
    );
    this.titlePrefix = "Courriers";
  }

  public openContactForm(): void {
    this.editContactDetails = !this.editContactDetails;
  }
}
