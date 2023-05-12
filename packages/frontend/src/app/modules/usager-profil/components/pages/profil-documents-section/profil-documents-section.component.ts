import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { AuthService } from "../../../../shared/services/auth.service";

import { UsagerProfilService } from "../../../services/usager-profil.service";
import { DocumentService } from "../../../../usager-shared/services/document.service";

import { BaseUsagerProfilPageComponent } from "../base-usager-profil-page/base-usager-profil-page.component";
import { CerfaDocType } from "../../../../../../_common/model";

@Component({
  selector: "app-profil-documents-section",
  templateUrl: "./profil-documents-section.component.html",
  styleUrls: ["./profil-documents-section.component.css"],
})
export class ProfilDocumentsSectionComponent extends BaseUsagerProfilPageComponent {
  constructor(
    public authService: AuthService,
    public usagerProfilService: UsagerProfilService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router,
    public documentService: DocumentService
  ) {
    super(
      authService,
      usagerProfilService,
      titleService,
      toastService,
      route,
      router
    );
    this.titlePrefix = "Documents";
  }

  public getCerfa(typeCerfa: CerfaDocType = "attestation"): void {
    return this.documentService.attestation(this.usager.ref, typeCerfa);
  }
}