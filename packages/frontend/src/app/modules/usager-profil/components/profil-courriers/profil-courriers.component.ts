import { Component, Input, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AppUser, UsagerLight } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { UsagerService } from "../../../usagers/services/usager.service";
import { UsagerProfilService } from "../../services/usager-profil.service";

@Component({
  selector: "app-profil-courriers",
  templateUrl: "./profil-courriers.component.html",
  styleUrls: ["./profil-courriers.component.css"],
})
export class ProfilCourriersComponent implements OnInit {
  public me: AppUser;
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

    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    this.usagerProfilService.findOne(this.route.snapshot.params.id).subscribe(
      (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
        console.log(this.usager);
      },
      (error) => {
        this.notifService.error("Le dossier recherché n'existe pas");
        this.router.navigate(["404"]);
      }
    );
  }

  public onUsagerChanges(usager: UsagerLight) {
    this.usager = new UsagerFormModel(usager);
  }
}
