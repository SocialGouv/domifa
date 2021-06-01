import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { FormGroup, FormBuilder, FormArray, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbDateStruct, NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { ToastrService } from "ngx-toastr";
import { AppUser, UserRole, UsagerLight } from "../../../../../_common/model";
import { InteractionType } from "../../../../../_common/model/interaction";
import { StructureDocTypesAvailable } from "../../../../../_common/model/structure-doc";

import {
  minDateNaissance,
  formatDateToNgb,
} from "../../../../shared/bootstrap-util";
import { DECISION_STATUT_LABELS } from "../../../../shared/constants/USAGER_LABELS.const";
import { regexp } from "../../../../shared/validators";
import { AuthService } from "../../../shared/services/auth.service";

import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { interactionsLabels } from "../../../../shared/constants/INTERACTIONS_LABELS.const";
import { AyantDroit } from "../../../usagers/interfaces/ayant-droit";
import { Interaction } from "../../../usagers/interfaces/interaction";

import { DocumentService } from "../../../usager-shared/services/document.service";

import { UsagerProfilService } from "../../services/usager-profil.service";

@Component({
  selector: "app-profil-general-section",
  templateUrl: "./profil-general-section.component.html",
  styleUrls: ["./profil-general-section.component.css"],
})
export class ProfilGeneralSectionComponent implements OnInit {
  // Affichage des formulaires d'édition

  public editEntretien: boolean;
  public editAyantsDroits: boolean;
  public acceptInteractions: boolean;
  public editCustomId: boolean;

  public submitted: boolean;

  public typeInteraction: InteractionType;
  public interactions: Interaction[];

  public interactionsLabels: {
    [key: string]: any;
  } = interactionsLabels;

  public actions: {
    [key: string]: any;
  };

  public motifsRadiation: { [key: string]: string };

  // public labels: any = usagersLabels;

  public usager: UsagerFormModel;
  public usagerForm!: FormGroup;
  public ayantsDroitsForm!: FormGroup;

  public notifInputs: { [key: string]: any };

  public today: Date;
  public me: AppUser;

  @ViewChild("distributionConfirm", { static: true })
  public distributionConfirm!: TemplateRef<any>;

  @ViewChild("setInteractionInModal", { static: true })
  public setInteractionInModal!: TemplateRef<any>;

  @ViewChild("setInteractionOutModal", { static: true })
  public setInteractionOutModal!: TemplateRef<any>;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  public DECISION_STATUT_LABELS = DECISION_STATUT_LABELS;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private modalService: NgbModal,

    private notifService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,

    private usagerProfilService: UsagerProfilService,
    private titleService: Title,

    private documentService: DocumentService
  ) {
    this.submitted = false;
    this.editCustomId = false;
    this.acceptInteractions = true;

    this.today = new Date();

    this.interactions = [];

    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());

    this.notifInputs = {
      colisIn: 0,
      courrierIn: 0,
      recommandeIn: 0,
    };

    this.actions = {
      EDIT: "Modification",
      DELETE: "Suppression",
      CREATION: "Création",
    };
  }

  public isRole(role: UserRole) {
    return this.me.role === role;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Fiche d'un domicilié");
    //

    this.authService.currentUserSubject.subscribe((user: AppUser) => {
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

  get f() {
    return this.usagerForm.controls;
  }

  get ayantsDroits() {
    return this.usagerForm.get("ayantsDroits") as FormArray;
  }

  public addAyantDroit(ayantDroit: AyantDroit = new AyantDroit()): void {
    (this.usagerForm.controls.ayantsDroits as FormArray).push(
      this.newAyantDroit(ayantDroit)
    );
  }

  public deleteAyantDroit(i: number): void {
    if (i === 0) {
      this.usagerForm.controls.ayantsDroitsExist.setValue(false);
    }

    (this.usagerForm.controls.ayantsDroits as FormArray).removeAt(i);
  }

  public newAyantDroit(ayantDroit: AyantDroit) {
    return this.formBuilder.group({
      dateNaissance: [
        ayantDroit.dateNaissance,
        [Validators.pattern(regexp.date), Validators.required],
      ],
      lien: [ayantDroit.lien, Validators.required],
      nom: [ayantDroit.nom, Validators.required],
      prenom: [ayantDroit.prenom, Validators.required],
    });
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

  public open(content: TemplateRef<any>) {
    this.modalService.open(content);
  }

  public closeModals() {
    this.modalService.dismissAll();
  }

  public deleteUsager() {
    this.usagerProfilService.delete(this.usager.ref).subscribe(
      (result: any) => {
        this.modalService.dismissAll();
        this.notifService.success("Usager supprimé avec succès");
        this.router.navigate(["/manage"]);
      },
      (error) => {
        this.notifService.error("Impossible de supprimer la fiche");
      }
    );
  }

  public getStructureDocument(docType: StructureDocTypesAvailable) {
    this.documentService.getStructureDoc(this.usager.ref, docType).subscribe(
      (blob: any) => {
        const newBlob = new Blob([blob], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        saveAs(newBlob, docType + ".docx");
      },
      (error: any) => {}
    );
  }

  public closeModal() {
    this.modalService.dismissAll();
  }

  public openInteractionInModal() {
    this.modalService.open(this.setInteractionInModal);
  }

  public openInteractionOutModal() {
    this.modalService.open(this.setInteractionOutModal);
  }
}
