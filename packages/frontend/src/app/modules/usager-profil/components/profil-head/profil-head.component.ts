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
import {
  UsagerLight,
  UserStructure,
  UserStructureRole,
} from "../../../../../_common/model";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { UsagerProfilService } from "../../services/usager-profil.service";

@Component({
  selector: "app-profil-head",
  templateUrl: "./profil-head.component.html",
  styleUrls: ["./profil-head.component.css"],
})
export class ProfilHeadComponent implements OnInit {
  @Input() public usager: UsagerFormModel;
  @Input() public me: UserStructure;

  @Input() public section: string;

  public today: Date;

  @ViewChild("renewModal", { static: true })
  public renewModal!: TemplateRef<any>;

  constructor(
    private readonly modalService: NgbModal,
    private readonly notifService: ToastrService,
    private readonly router: Router,
    private readonly usagerProfilService: UsagerProfilService
  ) {
    this.today = new Date();
  }

  public ngOnInit(): void {}

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public isRole(role: UserStructureRole): boolean {
    return this.me.role === role;
  }

  public renouvellement(): void {
    this.usagerProfilService.renouvellement(this.usager.ref).subscribe({
      next: (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
        this.closeModals();
        this.notifService.success(
          "Votre demande a été enregistrée. Merci de remplir l'ensemble du dossier"
        );
        this.router.navigate(["usager/" + usager.ref + "/edit"]);
      },
      error: () => {
        this.notifService.error("Impossible d'enregistrer cette interaction");
      },
    });
  }

  public openRenewModal() {
    this.modalService.open(this.renewModal);
  }
}
