import {
  AfterViewInit,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
import { saveAs } from "file-saver";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import {
  formatDateToNgb,
  minDateNaissance,
} from "src/app/shared/bootstrap-util";
import { regexp } from "src/app/shared/validators";
import {
  AppUser,
  UsagerLight,
  UsagerOptionsProcuration,
  UserRole,
} from "../../../../../_common/model";
import { InteractionType } from "../../../../../_common/model/interaction";
import { StructureDocTypesAvailable } from "../../../../../_common/model/structure-doc";
import { ETAPES_DEMANDE_URL } from "../../../../../_common/model/usager/constants";
import { languagesAutocomplete } from "../../../../shared";

import { AyantDroit } from "../../interfaces/ayant-droit";
import { Interaction } from "../../interfaces/interaction";
import { Options } from "../../interfaces/options";
import { isProcurationActifMaintenant } from "../../services";
import { DocumentService } from "../../services/document.service";
import { InteractionService } from "../../services/interaction.service";
import { UsagerService } from "../../services/usager.service";
import { UsagerFormModel } from "../form/UsagerFormModel";

import { INTERACTIONS_IN_AVAILABLE } from "../../../../../_common/model/interaction/constants/INTERACTIONS_IN_AVAILABLE.const";
import { INTERACTIONS_LABELS_SINGULIER } from "../../../../../_common/model/interaction/constants";
import { ProfilHistoriqueSmsComponent } from "../profil-historique-sms/profil-historique-sms.component";
import { LIEN_PARENTE_LABELS } from "../../../../../_common/model/usager/constants/LIEN_PARENTE_LABELS.const";
import { MessageSms } from "../../../../../_common/model/message-sms";

@Component({
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-profil",
  styleUrls: ["./profil.css"],
  templateUrl: "./profil.html",
})
export class UsagersProfilComponent implements OnInit, AfterViewInit {
  // Affichage des formulaires d'édition
  public editInfos: boolean;
  public editEntretien: boolean;
  public editAyantsDroits: boolean;
  public acceptInteractions: boolean;
  public editCustomId: boolean;

  public submitted: boolean;

  public typeInteraction: InteractionType;
  public interactions: Interaction[];

  public etapesUrl = ETAPES_DEMANDE_URL;

  public languagesAutocomplete = languagesAutocomplete;

  public languagesAutocompleteSearch = languagesAutocomplete.typeahead({
    maxResults: 10,
  });

  public INTERACTIONS_LABELS_SINGULIER = INTERACTIONS_LABELS_SINGULIER;
  public LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;

  public actions: {
    [key: string]: any;
  };

  public usager: UsagerFormModel;
  public usagerForm!: FormGroup;
  public ayantsDroitsForm!: FormGroup;

  public messagesList: MessageSms[];
  public messagesError: number;

  public notifInputs: { [key: string]: any };

  public today: Date;
  public me: AppUser;

  @ViewChild("distributionConfirm", { static: true })
  public distributionConfirm!: TemplateRef<any>;

  @ViewChild("smsHistory") smsHistory: ProfilHistoriqueSmsComponent;

  @ViewChild("setInteractionInModal", { static: true })
  public setInteractionInModal!: TemplateRef<any>;

  @ViewChild("setInteractionOutModal", { static: true })
  public setInteractionOutModal!: TemplateRef<any>;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  constructor(
    private formBuilder: FormBuilder,
    private interactionService: InteractionService,
    private authService: AuthService,
    private modalService: NgbModal,
    private nbgDate: NgbDateCustomParserFormatter,
    private notifService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private usagerService: UsagerService,
    private titleService: Title,
    private matomo: MatomoTracker,
    private documentService: DocumentService
  ) {
    this.editAyantsDroits = false;
    this.editEntretien = false;
    this.editInfos = false;
    this.submitted = false;
    this.editCustomId = false;
    this.acceptInteractions = true;

    this.today = new Date();

    this.interactions = [];

    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());
    this.messagesError = 0;
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

  public ngAfterViewInit() {
    this.getMySms();
  }

  public isRole(role: UserRole) {
    return this.me.role === role;
  }

  public getMySms() {
    this.usagerService.findMySms(this.usager).subscribe({
      next: (messages: MessageSms[]) => {
        this.messagesList = messages;
        this.messagesError = 0;

        // Vérification du nombre d'échecs des 3 derniners messages
        for (let i = 0; i < messages.length && i < 4; i++) {
          if (
            messages[i].status === "FAILURE" ||
            messages[i].status === "EXPIRED"
          ) {
            this.messagesError++;
          }
        }
      },
    });
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Fiche d'un domicilié");

    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    if (!this.route.snapshot.params.id) {
      this.router.navigate(["/404"]);
      return;
    }

    this.usagerService.findOne(this.route.snapshot.params.id).subscribe(
      (usager: UsagerLight) => {
        if (
          usager.decision.statut === "ATTENTE_DECISION" &&
          usager.typeDom === "PREMIERE_DOM"
        ) {
          this.router.navigate(["/usager/" + usager.ref + "/edit"]);
        }

        // Refus : interdits pour les facteurs
        if (usager.decision.statut === "REFUS") {
          if (
            this.me.role !== "admin" &&
            this.me.role !== "responsable" &&
            this.me.role !== "simple"
          ) {
            this.notifService.error(
              "Vos droits ne vous permettent pas d'accéder à cette page"
            );
            this.router.navigate(["/manage"]);
          }
        }

        this.usager = new UsagerFormModel(usager);
        this.getMySms();
        this.getInteractions();
        this.initForms();
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

  public initForms() {
    this.usagerForm = this.formBuilder.group({
      ayantsDroits: this.formBuilder.array([]),
      ayantsDroitsExist: [this.usager.ayantsDroitsExist, []],
      customRef: [this.usager.customRef, []],
      dateNaissance: [
        formatDateToNgb(this.usager.dateNaissance),
        [Validators.required],
      ],
      email: [this.usager.email, [Validators.email]],
      ref: [this.usager.ref, [Validators.required]],
      langue: [this.usager.langue, languagesAutocomplete.validator("langue")],
      nom: [this.usager.nom, Validators.required],
      phone: [this.usager.phone, [Validators.pattern(regexp.phone)]],
      prenom: [this.usager.prenom, Validators.required],
      sexe: [this.usager.sexe, Validators.required],
      surnom: [this.usager.surnom, []],
      villeNaissance: [this.usager.villeNaissance, [Validators.required]],
    });

    for (const ayantDroit of this.usager.ayantsDroits) {
      this.addAyantDroit(ayantDroit);
    }
  }

  public updateInfos() {
    this.submitted = true;
    if (this.usagerForm.invalid) {
      this.notifService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
    } else {
      const usagerFormValues = this.usagerForm.value;
      usagerFormValues.ayantsDroits.map((ayantDroit: any) => {
        ayantDroit.dateNaissance = new Date(
          this.nbgDate.formatEn(ayantDroit.dateNaissance)
        );
      });

      const formValue: UsagerFormModel = {
        ...usagerFormValues,
        dateNaissance: this.nbgDate.formatEn(
          this.usagerForm.controls.dateNaissance.value
        ),
        etapeDemande: this.usager.etapeDemande,
      };

      this.usagerService.create(formValue).subscribe(
        (usager: UsagerLight) => {
          this.submitted = false;
          this.notifService.success("Enregistrement réussi");
          this.usager = new UsagerFormModel(usager);
          this.editInfos = false;
          this.editAyantsDroits = false;
        },
        (error) => {
          if (error.statusCode && error.statusCode === 400) {
            this.notifService.error(
              "Veuillez vérifiez les champs du formulaire"
            );
          }
        }
      );
    }
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
        formatDateToNgb(ayantDroit.dateNaissance),
        [Validators.required],
      ],
      lien: [ayantDroit.lien, Validators.required],
      nom: [ayantDroit.nom, Validators.required],
      prenom: [ayantDroit.prenom, Validators.required],
    });
  }

  public renouvellement() {
    this.matomo.trackEvent(
      "test-nouveau-profil",
      "actions",
      "renouvellement",
      1
    );

    this.usagerService.renouvellement(this.usager.ref).subscribe(
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

  public deleteInteraction(idInteraction: number) {
    this.matomo.trackEvent("test-nouveau-profil", "interactions", "delete", 1);
    this.interactionService.delete(this.usager.ref, idInteraction).subscribe(
      (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
        this.notifService.success("Interactionn supprimée avec succès");
        this.getInteractions();
      },
      (error) => {
        this.notifService.error("Impossible de supprimer l'interaction");
      }
    );
  }

  public deleteUsager() {
    this.matomo.trackEvent(
      "test-nouveau-profil",
      "actions",
      "supprimer-usager",
      1
    );
    this.usagerService.delete(this.usager.ref).subscribe(
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

  public notifier(cpt: number) {
    if (cpt >= INTERACTIONS_IN_AVAILABLE.length) {
      return;
    }

    const item: InteractionType = INTERACTIONS_IN_AVAILABLE[cpt];

    if (this.notifInputs[item] === 0) {
      this.notifier(cpt + 1);
    } else {
      this.matomo.trackEvent(
        "test-nouveau-profil",
        "form-interaction",
        item,
        1
      );
      this.interactionService
        .setInteraction(this.usager, [
          {
            content: "",
            nbCourrier: this.notifInputs[item],
            type: item,
          },
        ])
        .subscribe(
          (usager: UsagerLight) => {
            this.notifService.success(INTERACTIONS_LABELS_SINGULIER[item]);
            this.usager = new UsagerFormModel(usager);
            this.usager.lastInteraction = usager.lastInteraction;
            this.notifInputs[item] = 0;
            this.getInteractions();
            this.notifier(cpt + 1);
          },
          () => {
            this.notifService.error(
              "Impossible d'enregistrer cette interaction"
            );
          }
        );
    }
  }

  public isProcurationActifMaintenant(procuration: UsagerOptionsProcuration) {
    return isProcurationActifMaintenant(procuration);
  }

  public setInteraction(type: InteractionType, procuration?: boolean) {
    const interaction: {
      content?: string;
      type: InteractionType;
      nbCourrier: number;
      procuration?: boolean;
      transfert?: boolean;
    } = {
      content: "",
      type,
      nbCourrier: 1,
    };

    this.matomo.trackEvent("test-nouveau-profil", "gros-icones", type, 1);

    if (type.substring(type.length - 3) === "Out") {
      if (isProcurationActifMaintenant(this.usager.options.procuration)) {
        if (typeof procuration === "undefined") {
          this.typeInteraction = type;
          this.modalService.open(this.distributionConfirm);
          // open
          return;
        }
        this.modalService.dismissAll();
        interaction.procuration = procuration;
      }
    }

    if (!interaction.nbCourrier) {
      interaction.nbCourrier = 1;
    }

    this.interactionService
      .setInteraction(this.usager, [interaction])
      .subscribe(
        (usager: UsagerLight) => {
          this.usager = new UsagerFormModel(usager);
          this.notifService.success(INTERACTIONS_LABELS_SINGULIER[type]);
          this.usager.lastInteraction = usager.lastInteraction;
          this.getInteractions();
        },
        () => {
          this.notifService.error("Impossible d'enregistrer cette interaction");
        }
      );
  }

  public getAttestation() {
    this.matomo.trackEvent(
      "test-nouveau-profil",
      "boutons",
      "telechargement-attestation",
      1
    );
    return this.usagerService.attestation(this.usager.ref);
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

  public stopCourrier() {
    this.matomo.trackEvent(
      "test-nouveau-profil",
      "interactions",
      "stop-courrier",
      1
    );

    this.usagerService.stopCourrier(this.usager.ref).subscribe(
      (usager: UsagerLight) => {
        this.usager.options = new Options(usager.options);
        this.setInteraction("npai", false);
      },
      () => {
        this.notifService.error("Cette opération a échoué");
      }
    );
  }

  public closeModal() {
    this.modalService.dismissAll();
  }

  private getInteractions() {
    this.interactionService
      .getInteractions({ usagerRef: this.usager.ref, maxResults: 30 })
      .subscribe((interactions: Interaction[]) => {
        this.interactions = interactions;
      });
  }

  public openInteractionInModal(usager: UsagerFormModel) {
    this.modalService.open(this.setInteractionInModal);
  }

  public openInteractionOutModal(usager: UsagerFormModel) {
    this.modalService.open(this.setInteractionOutModal);
  }
}
