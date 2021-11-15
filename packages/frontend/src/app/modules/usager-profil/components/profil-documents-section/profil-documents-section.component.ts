import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { UsagerLight, UserStructure } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { UsagerProfilService } from "../../services/usager-profil.service";
import { DocumentService } from "./../../../usager-shared/services/document.service";
import { CerfaDocType } from "src/_common/model/cerfa";
import { UsagerNomCompletPipe } from "../../../shared/pipes/usager-nom-complet.pipe";

@Component({
  selector: "app-profil-documents-section",
  templateUrl: "./profil-documents-section.component.html",
  styleUrls: ["./profil-documents-section.component.css"],
})
export class ProfilDocumentsSectionComponent implements OnInit {
  public me: UserStructure;

  public usager: UsagerFormModel;

  constructor(
    private authService: AuthService,
    private usagerProfilService: UsagerProfilService,
    private documentService: DocumentService,
    private titleService: Title,
    private notifService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private usagerNomCompletPipe: UsagerNomCompletPipe
  ) {
    this.me = null;
  }

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    //
    if (!this.route.snapshot.params.id) {
      this.router.navigate(["/404"]);
      return;
    }

    this.usagerProfilService.findOne(this.route.snapshot.params.id).subscribe({
      next: (usager: UsagerLight) => {
        const name = this.usagerNomCompletPipe.transform(usager);
        this.titleService.setTitle("Documents de " + name);
        this.usager = new UsagerFormModel(usager);
      },
      error: () => {
        this.notifService.error("Le dossier recherché n'existe pas");
        this.router.navigate(["404"]);
      },
    });
  }

  public getCerfa(typeCerfa: CerfaDocType = "attestation"): void {
    return this.documentService.attestation(this.usager.ref, typeCerfa);
  }
}
