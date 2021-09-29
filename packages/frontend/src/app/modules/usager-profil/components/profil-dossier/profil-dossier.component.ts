import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import {
  UsagerLight,
  UserStructure,
  UserStructureRole,
} from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { UsagerService } from "../../../usagers/services/usager.service";

@Component({
  selector: "app-profil-dossier",
  templateUrl: "./profil-dossier.component.html",
  styleUrls: ["./profil-dossier.component.css"],
})
export class ProfilDossierComponent implements OnInit {
  public me: UserStructure;
  public usager: UsagerFormModel;

  public editInfos: boolean;
  public editEntretien: boolean;

  constructor(
    private authService: AuthService,
    private usagerService: UsagerService,
    private titleService: Title,
    private notifService: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.me = null;
    this.editInfos = false;
    this.editEntretien = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Dossier du domicilié");

    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    this.usagerService.findOne(this.route.snapshot.params.id).subscribe(
      (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
      },
      () => {
        this.notifService.error("Le dossier recherché n'existe pas");
        this.router.navigate(["404"]);
      }
    );
  }

  public openEntretien(): void {
    this.editEntretien = !this.editEntretien;
  }

  public isRole(role: UserStructureRole): boolean {
    return this.me.role === role;
  }

  public onUsagerChanges(usager: UsagerLight): void {
    this.usager = new UsagerFormModel(usager);
  }
}
