import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { AppUser } from "../../../../../../../_common/model";

@Component({
  providers: [UsagerService],
  selector: "app-documents-form",
  templateUrl: "./documents-form.component.html",
})
export class DocumentsFormComponent implements OnInit {
  public usager: Usager;
  public me: AppUser;

  constructor(
    private usagerService: UsagerService,
    public authService: AuthService,
    public router: Router,
    private titleService: Title,
    private route: ActivatedRoute
  ) {
    this.authService.currentUser.subscribe((user: AppUser) => {
      this.me = user;
    });
  }
  public ngOnInit() {
    this.titleService.setTitle("Pièces-jointes du dossier");

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerService.findOne(id).subscribe(
        (usager: Usager) => {
          this.usager = usager;
        },
        (error) => {
          this.router.navigate(["404"]);
        }
      );
    } else {
      this.router.navigate(["404"]);
    }
  }

  public nextStep(step: number) {
    this.usagerService
      .nextStep(this.usager.id, step)
      .subscribe((usager: Usager) => {
        this.usager = usager;
        this.router.navigate(["usager/" + usager.id + "/edit/decision"]);
      });
  }
}
