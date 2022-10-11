import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { UsagerLight, UserStructure } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { UsagerProfilService } from "../../services/usager-profil.service";
import { DocumentService } from "./../../../usager-shared/services/document.service";
import { CerfaDocType } from "src/_common/model/cerfa";

import { getUsagerNomComplet } from "../../../../shared/getUsagerNomComplet";

@Component({
  selector: "app-profil-documents-section",
  templateUrl: "./profil-documents-section.component.html",
  styleUrls: ["./profil-documents-section.component.css"],
})
export class ProfilDocumentsSectionComponent implements OnInit {
  public me!: UserStructure;

  public usager!: UsagerFormModel;

  constructor(
    private readonly authService: AuthService,
    private readonly usagerProfilService: UsagerProfilService,
    private readonly documentService: DocumentService,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    if (!this.route.snapshot.params.id) {
      this.router.navigate(["/404"]);
      return;
    }
    this.me = this.authService.currentUserValue;

    this.usagerProfilService.findOne(this.route.snapshot.params.id).subscribe({
      next: (usager: UsagerLight) => {
        const name = getUsagerNomComplet(usager);
        this.titleService.setTitle("Documents de " + name);
        this.usager = new UsagerFormModel(usager);
      },
      error: () => {
        this.toastService.error("Le dossier recherché n'existe pas");
        this.router.navigate(["404"]);
      },
    });
  }

  public getCerfa(typeCerfa: CerfaDocType = "attestation"): void {
    return this.documentService.attestation(this.usager.ref, typeCerfa);
  }
}
