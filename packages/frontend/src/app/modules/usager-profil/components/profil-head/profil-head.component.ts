import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AppUser, UsagerLight, UserRole } from "../../../../../_common/model";

import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";

import { UsagerProfilService } from "../../services/usager-profil.service";

@Component({
  selector: "app-profil-head",
  templateUrl: "./profil-head.component.html",
  styleUrls: ["./profil-head.component.css"],
})
export class ProfilHeadComponent implements OnInit {
  @Input() public usager: UsagerFormModel;
  @Input() public me: AppUser;

  @Input() public section: string;

  public today: Date;

  @ViewChild("renewModal", { static: true })
  public renewModal!: TemplateRef<any>;

  constructor(
    private modalService: NgbModal,
    private notifService: ToastrService,

    private router: Router,

    private usagerProfilService: UsagerProfilService
  ) {
    this.today = new Date();
  }

  public ngOnInit(): void {}

  public closeModals() {
    this.modalService.dismissAll();
  }

  public isRole(role: UserRole) {
    return this.me.role === role;
  }

  public renouvellement() {
    this.usagerProfilService.renouvellement(this.usager.ref).subscribe(
      (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
        this.modalService.dismissAll();
        this.router.navigate(["usager/" + usager.ref + "/edit"]);
        this.notifService.success(
          "Votre demande a été enregistrée. Merci de remplir l'ensemble du dossier"
        );
      },
      (error) => {
        this.notifService.error("Impossible d'enregistrer cette interaction");
      }
    );
  }

  public openRenewModal() {
    this.modalService.open(this.renewModal);
  }
}
