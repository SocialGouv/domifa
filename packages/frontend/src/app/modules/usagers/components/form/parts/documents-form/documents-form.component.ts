import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { AppUser, UsagerLight } from "../../../../../../../_common/model";

@Component({
  selector: "app-documents-form",
  templateUrl: "./documents-form.component.html",
})
export class DocumentsFormComponent implements OnInit {
  public usager: UsagerLight;

  public me: AppUser;

  constructor(
    private usagerService: UsagerService,
    private authService: AuthService,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute
  ) {}
  public ngOnInit() {
    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    this.titleService.setTitle("Pièces-jointes du dossier");

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerService.findOne(id).subscribe(
        (usager: UsagerLight) => {
          this.usager = usager;
        },
        () => {
          this.router.navigate(["404"]);
        }
      );
    } else {
      this.router.navigate(["404"]);
    }
  }

  public nextStep(step: number) {
    this.usagerService
      .nextStep(this.usager.ref, step)
      .subscribe((usager: UsagerLight) => {
        this.usager = usager;
        this.router.navigate(["usager/" + usager.ref + "/edit/decision"]);
      });
  }
}
