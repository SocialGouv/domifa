import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";

import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { AppUser } from "../../../../../../../_common/model";

@Component({
  providers: [UsagerService],
  selector: "app-entretien-form",
  templateUrl: "./entretien-form.component.html",
})
export class EntretienFormComponent implements OnInit {
  public usager: Usager;
  public me: AppUser;

  constructor(
    private usagerService: UsagerService,
    private notifService: ToastrService,
    private authService: AuthService,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.titleService.setTitle("Entretien avec l'usager");

    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerService.findOne(id).subscribe(
        (usager: Usager) => {
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

  public getAttestation() {
    return this.usagerService.attestation(this.usager.id);
  }

  public nextStep(step: number) {
    this.usagerService
      .nextStep(this.usager.id, step)
      .subscribe((usager: Usager) => {
        this.router.navigate(["usager/" + usager.id + "/edit/documents"]);
      });
  }

  public rdvNow() {
    const rdvFormValue = {
      isNow: true,
      dateRdv: new Date(),
      userId: this.me.id.toString(),
    };

    this.usagerService.createRdv(rdvFormValue, this.usager.id).subscribe(
      (usager: Usager) => {
        this.usager = usager;
      },
      () => {
        this.notifService.error(
          "Impossible de réaliser l'entretien maintenant"
        );
      }
    );
  }
}
