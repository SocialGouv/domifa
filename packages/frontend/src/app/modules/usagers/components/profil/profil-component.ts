import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
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
import { AppUser, UsagerLight, UserRole } from "../../../../../_common/model";
import { languagesAutocomplete } from "../../../../shared";
import { interactionsLabels } from "../../interactions.labels";
import { AyantDroit } from "../../interfaces/ayant-droit";
import { Interaction, InteractionTypes } from "../../interfaces/interaction";
import { Options } from "../../interfaces/options";
import { InteractionService } from "../../services/interaction.service";
import { UsagerService } from "../../services/usager.service";
import * as usagersLabels from "../../usagers.labels";
import { UsagerFormModel } from "../form/UsagerFormModel";

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
export class UsagersProfilComponent implements OnInit {
  // Affichage des formulaires d'édition
  public editInfos: boolean;
  public editEntretien: boolean;
  public editAyantsDroits: boolean;
  public acceptInteractions: boolean;
  public editCustomId: boolean;

  public submitted: boolean;

  public typeInteraction: InteractionTypes;
  public interactions: Interaction[];
  public interactionsType: string[] = ["courrierIn", "recommandeIn", "colisIn"];

  public languagesAutocomplete = languagesAutocomplete;

  public interactionsLabels: {
    [key: string]: any;
  } = interactionsLabels;

  public actions: {
    [key: string]: any;
  };

  public labels: any = usagersLabels;

  public usager: UsagerFormModel;
  public usagerForm!: FormGroup;
  public ayantsDroitsForm!: FormGroup;

  public notifInputs: { [key: string]: any };

  public isActif: boolean;

  public today: Date;
  public me: AppUser;

  @ViewChild("distributionConfirm", { static: true })
  public distributionConfirm!: TemplateRef<any>;
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
    private matomo: MatomoTracker
  ) {
    this.editAyantsDroits = false;
    this.editEntretien = false;
    this.editInfos = false;
    this.submitted = false;
    this.editCustomId = false;
    this.acceptInteractions = true;

    this.isActif = false;
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

  public ngOnInit() {
    this.titleService.setTitle("Fiche d'un domicilié");
    //

    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    //
    if (this.route.snapshot.params.id) {
      this.usagerService.findOne(this.route.snapshot.params.id).subscribe(
        (usager: UsagerLight) => {
          if (
            usager.decision.statut === "ATTENTE_DECISION" &&
            usager.typeDom === "PREMIERE"
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
              return false;
            }
          }

          this.isActif =
            usager.decision.statut === "VALIDE" ||
            (usager.decision.statut === "INSTRUCTION" &&
              usager.typeDom === "RENOUVELLEMENT") ||
            (usager.decision.statut === "ATTENTE_DECISION" &&
              usager.typeDom === "RENOUVELLEMENT");

          this.usager = new UsagerFormModel(usager);

          this.getInteractions();
          this.initForms();
        },
        () => {
          this.router.navigate(["/404"]);
        }
      );
    } else {
      this.router.navigate(["/404"]);
      return;
    }
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
      const formValue = {
        ...this.usagerForm.value,
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
        ayantDroit.dateNaissance,
        [Validators.pattern(regexp.date), Validators.required],
      ],
      lien: [ayantDroit.lien, Validators.required],
      nom: [ayantDroit.nom, Validators.required],
      prenom: [ayantDroit.prenom, Validators.required],
    });
  }

  public renouvellement() {
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
    this.matomo.trackEvent("profil", "interactions", "delete", 1);
    this.interactionService
      .delete(this.usager.ref, idInteraction)
      .subscribe((usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
        this.getInteractions();
      });
  }

  public deleteUsager() {
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
    if (cpt >= this.interactionsType.length) {
      return;
    }

    const item = this.interactionsType[cpt];
    if (this.notifInputs[item] === 0) {
      this.notifier(cpt + 1);
    } else {
      this.matomo.trackEvent("interactions", "profil_icones", item, 1);
      this.interactionService
        .setInteraction(this.usager, {
          content: "",
          nbCourrier: this.notifInputs[item],
          type: item,
        })
        .subscribe(
          (usager: UsagerLight) => {
            this.notifService.success(interactionsLabels[item]);
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

  public setInteraction(type: InteractionTypes, procuration?: boolean) {
    const interaction: {
      content?: string;
      type?: string;
      nbCourrier?: number;
      procuration?: boolean;
      transfert?: boolean;
    } = {
      content: "",
      type,
    };

    this.matomo.trackEvent("interactions", "profil_icones", type, 1);

    if (type.substring(type.length - 3) === "Out") {
      if (this.usager.options.procuration.actif) {
        if (typeof procuration === "undefined") {
          this.typeInteraction = type;
          this.modalService.open(this.distributionConfirm);
          // open
          return;
        }
        this.modalService.dismissAll();
        interaction.procuration = procuration;
      }

      if (this.usager.options.transfert.actif) {
        interaction.transfert = true;
      }
    }

    if (!interaction.nbCourrier) {
      interaction.nbCourrier = 1;
    }

    this.interactionService.setInteraction(this.usager, interaction).subscribe(
      (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);

        this.notifService.success(interactionsLabels[type]);
        this.usager.lastInteraction = usager.lastInteraction;
        this.getInteractions();
      },
      () => {
        this.notifService.error("Impossible d'enregistrer cette interaction");
      }
    );
  }

  public getDateFin(): Date {
    if (this.usager.decision.statut === "VALIDE") {
      return this.usager.decision.dateFin;
    } else if (
      this.usager.decision.statut === "INSTRUCTION" &&
      this.usager.typeDom === "RENOUVELLEMENT"
    ) {
      return this.usager.historique[0].dateFin;
    } else if (
      this.usager.decision.statut === "ATTENTE_DECISION" &&
      this.usager.typeDom === "RENOUVELLEMENT"
    ) {
      return this.usager.historique[1].dateFin;
    }
  }

  public getAttestation() {
    return this.usagerService.attestation(this.usager.ref);
  }

  public stopCourrier() {
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

  public openEntretien() {
    this.matomo.trackEvent("profil", "actions", "editEntretien", 1);
    this.editEntretien = !this.editEntretien;
  }

  private getInteractions() {
    this.interactionService
      .getInteractions(this.usager.ref)
      .subscribe((interactions: Interaction[]) => {
        this.interactions = interactions;
      });
  }
}
