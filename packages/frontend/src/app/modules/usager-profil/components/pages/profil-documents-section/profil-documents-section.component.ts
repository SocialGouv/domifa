import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { AuthService } from "../../../../shared/services/auth.service";

import { UsagerProfilService } from "../../../services/usager-profil.service";
import { DocumentService } from "../../../../usager-shared/services/document.service";

import { BaseUsagerProfilPageComponent } from "../base-usager-profil-page/base-usager-profil-page.component";
import { Store } from "@ngrx/store";
import { CerfaDocType } from "@domifa/common";
import { UsagerState } from "../../../../../shared";

@Component({
  selector: "app-profil-documents-section",
  templateUrl: "./profil-documents-section.component.html",
})
export class ProfilDocumentsSectionComponent extends BaseUsagerProfilPageComponent {
  constructor(
    protected readonly authService: AuthService,
    protected readonly usagerProfilService: UsagerProfilService,
    protected readonly titleService: Title,
    protected readonly toastService: CustomToastService,
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
    protected readonly store: Store<UsagerState>,
    protected readonly documentService: DocumentService
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
    this.titlePrefix = "Documents";
  }

  public getCerfa(typeCerfa: CerfaDocType = "attestation"): void {
    return this.documentService.attestation(this.usager.ref, typeCerfa);
  }
}
