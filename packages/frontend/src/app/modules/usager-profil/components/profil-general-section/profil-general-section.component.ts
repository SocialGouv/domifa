import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbDateStruct, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import {
  UsagerLight,
  UserStructure,
  UserStructureRole,
} from "../../../../../_common/model";
import {
  InteractionForApi,
  InteractionType,
} from "../../../../../_common/model/interaction";
import { USAGER_DECISION_STATUT_LABELS } from "../../../../../_common/model/usager/constants";
import {
  formatDateToNgb,
  minDateNaissance,
} from "../../../../shared/bootstrap-util";
import { INTERACTIONS_LABELS_SINGULIER } from "../../../../shared/constants/INTERACTIONS_LABELS.const";
import { AuthService } from "../../../shared/services/auth.service";
import { InteractionService } from "../../../usager-shared/services/interaction.service";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { Interaction } from "../../../usagers/interfaces/interaction";
import { UsagerProfilService } from "../../services/usager-profil.service";
import { ProfilGeneralHistoriqueCourriersComponent } from "../profil-general-historique-courriers/profil-general-historique-courriers.component";

@Component({
  selector: "app-profil-general-section",
  templateUrl: "./profil-general-section.component.html",
  styleUrls: ["./profil-general-section.component.css"],
})
export class ProfilGeneralSectionComponent implements OnInit {
  public typeInteraction: InteractionType;
  public interactions: Interaction[];

  public actions: {
    [key: string]: string;
  };

  public motifsRadiation: { [key: string]: string };

  public usager: UsagerFormModel;

  public notifInputs: { [key: string]: any };

  public today: Date;
  public me: UserStructure;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  @ViewChild("distributionConfirm", { static: true })
  public distributionConfirm!: TemplateRef<any>;

  @ViewChild("addNoteInModal", { static: true })
  public addNoteInModal!: TemplateRef<any>;

  @ViewChild("setInteractionInModal", { static: true })
  public setInteractionInModal!: TemplateRef<any>;

  @ViewChild("setInteractionOutModal", { static: true })
  public setInteractionOutModal!: TemplateRef<any>;

  @ViewChild(ProfilGeneralHistoriqueCourriersComponent)
  private profileComponent: ProfilGeneralHistoriqueCourriersComponent;

  public USAGER_DECISION_STATUT_LABELS = USAGER_DECISION_STATUT_LABELS;

  constructor(
    private authService: AuthService,
    private modalService: NgbModal,
    private notifService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private usagerProfilService: UsagerProfilService,
    private titleService: Title,
    private interactionService: InteractionService
  ) {
    this.interactions = [];

    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());

    this.actions = {
      EDIT: "Modification",
      DELETE: "Suppression",
      CREATION: "Création",
    };

    this.today = new Date();
  }

  public isRole(role: UserStructureRole) {
    return this.me.role === role;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Fiche d'un domicilié");
    //

    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    //
    if (!this.route.snapshot.params.id) {
      this.router.navigate(["/404"]);
      return;
    }

    this.usagerProfilService.findOne(this.route.snapshot.params.id).subscribe(
      (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
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

  public setSingleInteraction(usagerRef: number, type: InteractionType): void {
    const interaction: InteractionForApi = {
      type,
      nbCourrier: 1,
    };

    this.interactionService.setInteraction(usagerRef, [interaction]).subscribe({
      next: (newUsager: UsagerLight) => {
        this.usager = new UsagerFormModel(newUsager);
        this.notifService.success(INTERACTIONS_LABELS_SINGULIER[type]);
        this.updateInteractions();
      },
      error: () => {
        this.notifService.error("Impossible d'enregistrer cette interaction");
      },
    });
  }

  public stopCourrier() {
    this.usagerProfilService.stopCourrier(this.usager.ref).subscribe({
      next: (newUsager: UsagerLight) => {
        this.notifService.success("Le courrier ne sera plus enregistré ");
        this.usager = new UsagerFormModel(newUsager);
        this.updateInteractions();
      },
      error: () => {
        this.notifService.error("Impossible d'enregistrer cette interaction");
      },
    });
  }

  public updateInteractions() {
    this.profileComponent.getInteractions();
  }

  public closeModals() {
    this.modalService.dismissAll();
  }

  public openAddNoteInModal() {
    this.modalService.open(this.addNoteInModal);
  }

  public openInteractionInModal() {
    this.modalService.open(this.setInteractionInModal);
  }

  public openInteractionOutModal() {
    this.modalService.open(this.setInteractionOutModal);
  }
}
