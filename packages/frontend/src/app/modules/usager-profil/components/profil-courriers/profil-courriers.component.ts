import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { UserStructure, UsagerLight } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerProfilService } from "../../services/usager-profil.service";

@Component({
  selector: "app-profil-courriers",
  templateUrl: "./profil-courriers.component.html",
  styleUrls: ["./profil-courriers.component.css"],
})
export class ProfilCourriersComponent implements OnInit {
  public me: UserStructure;
  public usager: UsagerFormModel;

  constructor(
    private authService: AuthService,
    private usagerProfilService: UsagerProfilService,
    private titleService: Title,
    private notifService: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.me = null;
    this.usager = null;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Courrier du domicilié");
    //

    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    this.usagerProfilService.findOne(this.route.snapshot.params.id).subscribe(
      (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
      },
      () => {
        this.notifService.error("Le dossier recherché n'existe pas");
        this.router.navigate(["404"]);
      }
    );
  }

  public onUsagerChanges(usager: UsagerLight): void {
    this.usager = new UsagerFormModel(usager);
  }
}
