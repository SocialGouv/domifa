import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerLight, UserStructure } from "../../../../../_common/model";
import { UsagerDossierService } from "../../services/usager-dossier.service";

@Component({
  selector: "app-usager-documents-form",
  templateUrl: "./step-documents.component.html",
})
export class StepDocumentsComponent implements OnInit {
  public usager: UsagerLight;

  public me: UserStructure;
  public loading = false;

  constructor(
    private usagerDossierService: UsagerDossierService,
    private authService: AuthService,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    this.titleService.setTitle("Pièces-jointes du dossier");

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerDossierService.findOne(id).subscribe({
        next: (usager: UsagerLight) => {
          this.usager = usager;
        },
        error: () => {
          this.router.navigate(["404"]);
        },
      });
    } else {
      this.router.navigate(["404"]);
    }
  }

  public nextStep(step: number): void {
    this.loading = true;
    this.usagerDossierService
      .nextStep(this.usager.ref, step)
      .subscribe((usager: UsagerLight) => {
        this.usager = usager;
        this.router.navigate(["usager/" + usager.ref + "/edit/decision"]);
      });
  }
}
