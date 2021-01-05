import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { AppUser } from "../../../../../_common/model";
import { appUserBuilder } from "../../../users/services";
import { Usager } from "../../interfaces/usager";
import { UsagerService } from "../../services/usager.service";
import { motifsRadiation } from "../../usagers.labels";
@Component({
  providers: [UsagerService, AuthService],
  selector: "app-raft",
  styleUrls: ["./raft.component.css"],
  templateUrl: "./raft.component.html",
})
export class RaftComponent implements OnInit {
  public usager: Usager;
  public user: AppUser;

  public today: Date;
  public motifsRadiation: any;

  constructor(
    private usagerService: UsagerService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private matomo: MatomoTracker,
    private notifService: ToastrService
  ) {
    this.today = new Date();
    this.usager = new Usager();
    this.user = appUserBuilder.buildAppUser();
    this.motifsRadiation = motifsRadiation;
  }

  public ngOnInit() {
    this.titleService.setTitle("Radier un domicilié");
    if (this.route.snapshot.params.id) {
      this.authService.currentUserSubject.subscribe((user: AppUser) => {
        this.user = user;
      });

      this.usagerService.findOne(this.route.snapshot.params.id).subscribe(
        (usager: Usager) => {
          this.usager = usager;
        },
        () => {
          this.router.navigate(["/404"]);
        }
      );
    } else {
      this.router.navigate(["/404"]);
    }
  }

  public printPage() {
    window.print();
    this.matomo.trackEvent("tests", "impression_courrier_radiation", "null", 1);
  }

  public setDecision(statut: string) {
    this.usagerService
      .setDecision(this.usager.id, this.usager.decision, statut)
      .subscribe(
        (usager: Usager) => {
          this.usager = usager;
          this.notifService.success("Radiation effectuée avec succès");
        },
        () => {
          this.notifService.error("Une erreur est survenue");
        }
      );
  }
}
