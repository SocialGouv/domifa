import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AppUser, UsagerLight } from "../../../../../_common/model";
import { DECISION_LABELS } from "../../../../shared/constants/USAGER_LABELS.const";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { UsagerService } from "../../../usagers/services/usager.service";

@Component({
  selector: "app-profil-historique",
  templateUrl: "./profil-historique.component.html",
  styleUrls: ["./profil-historique.component.css"],
})
export class ProfilHistoriqueComponent implements OnInit {
  public me: AppUser;
  public usager: UsagerFormModel;

  public DECISION_LABELS = DECISION_LABELS;

  constructor(
    private authService: AuthService,
    private usagerService: UsagerService,
    private titleService: Title,
    private notifService: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.me = null;
  }

  ngOnInit(): void {
    this.titleService.setTitle("Courrier du domicilié");
    //

    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    this.usagerService.findOne(this.route.snapshot.params.id).subscribe(
      (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
      },
      (error) => {
        this.notifService.error("Le dossier recherché n'existe pas");
        this.router.navigate(["404"]);
      }
    );
  }
}
