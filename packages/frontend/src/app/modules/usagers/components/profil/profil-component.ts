import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

import { interactionsLabels } from "../../interactions.labels";
import * as usagersLabels from "../../usagers.labels";

import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModal,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";

import { LoadingService } from "../../../loading/loading.service";
import { DocumentService } from "../../services/document.service";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { InteractionService } from "../../services/interaction.service";
import { UsagerService } from "../../services/usager.service";

import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import { regexp } from "src/app/shared/validators";

import { AyantDroit } from "../../interfaces/ayant-droit";
import { Interaction, InteractionTypes } from "../../interfaces/interaction";
import { Options } from "../../interfaces/options";
import { Structure } from "src/app/modules/structures/structure.interface";
import { Usager } from "../../interfaces/usager";

import {
  minDateNaissance,
  minDateToday,
  formatDateToNgb,
} from "src/app/shared/bootstrap-util";
import { Title } from "@angular/platform-browser";
import { MatomoTracker } from "ngx-matomo";
import { User } from "src/app/modules/users/interfaces/user";

@Component({
  providers: [
    UsagerService,
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-profil",
  styleUrls: ["./profil.css"],
  templateUrl: "./profil.html",
})
export class UsagersProfilComponent implements OnInit {
  public editInfos: boolean;
  public editEntretien: boolean;
  public editAyantsDroits: boolean;
  public editTransfertForm: boolean;
  public editProcurationForm: boolean;
  public acceptInteractions: boolean;
  public editCustomId: boolean;
  public submitted: boolean;
  public typeInteraction: InteractionTypes;

  public interactions: Interaction[];
  public interactionsType: string[] = ["courrierIn", "recommandeIn", "colisIn"];

  public interactionsLabels: {
    [key: string]: any;
  };

  public labels: any;
  public liensLabels: any;
  public typeMenageList: any;
  public residenceList: any;
  public causeList: any;
  public raisonList: any;

  public usager: Usager;
  public usagerForm!: FormGroup;
  public ayantsDroitsForm!: FormGroup;
  public transfertForm!: FormGroup;
  public procurationForm!: FormGroup;

  public notifInputs: { [key: string]: any };

  public structure: Structure;

  public today: Date;

  public me: User;

  @ViewChild("distributionConfirm", { static: true })
  public distributionConfirm!: TemplateRef<any>;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;
  public minDateToday: NgbDateStruct;

  constructor(
    private documentService: DocumentService,
    private formBuilder: FormBuilder,
    private interactionService: InteractionService,
    public loadingService: LoadingService,
    public authService: AuthService,
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
    this.editProcurationForm = false;
    this.editTransfertForm = false;
    this.submitted = false;
    this.acceptInteractions = true;
    this.today = new Date();

    this.interactionsLabels = interactionsLabels;

    this.interactions = [];
    this.labels = usagersLabels;
    this.editCustomId = false;
    this.liensLabels = Object.keys(this.labels.lienParente);
    this.structure =
      this.authService.currentUserValue !== null
        ? this.authService.currentUserValue.structure
        : new Structure();

    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());

    this.usager = new Usager();

    this.notifInputs = {
      colisIn: 0,
      courrierIn: 0,
      recommandeIn: 0,
    };
  }

  public ngOnInit() {
    this.titleService.setTitle("Fiche d'un domicilié");
    this.me = this.authService.currentUserValue;
    if (this.route.snapshot.params.id) {
      this.usagerService.findOne(this.route.snapshot.params.id).subscribe(
        (usager: Usager) => {
          if (
            usager.decision.statut === "ATTENTE_DECISION" &&
            usager.typeDom === "PREMIERE"
          ) {
            this.router.navigate(["/usager/" + usager.id + "/edit"]);
          }

          // Refus : interdits pour les facteurs
          if (usager.decision.statut === "REFUS") {
            if (
              this.authService.currentUserValue.role !== "admin" &&
              this.authService.currentUserValue.role !== "simple"
            ) {
              this.notifService.error(
                "Vos droits ne vous permettent pas d'accéder à cette page"
              );
              this.router.navigate(["/manage"]);
              return false;
            }
          }

          this.usager = usager;

          this.getInteractions();
          this.initForms();
        },
        (error) => {
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

  get t() {
    return this.transfertForm.controls;
  }

  get p() {
    return this.procurationForm.controls;
  }

  public initForms() {
    this.transfertForm = this.formBuilder.group({
      adresse: [
        this.usager.options.transfert.adresse,
        [Validators.required, Validators.minLength(10)],
      ],
      dateFin: [this.usager.options.transfert.dateFin],
      dateFinPicker: [
        this.usager.options.transfert.dateFinPicker,
        [Validators.required],
      ],
      nom: [this.usager.options.transfert.nom, [Validators.required]],
    });

    this.procurationForm = this.formBuilder.group({
      dateFin: [this.usager.options.procuration.dateFin],
      dateFinPicker: [
        this.usager.options.procuration.dateFinPicker,
        [Validators.required],
      ],
      dateNaissancePicker: [
        this.usager.options.procuration.dateFinPicker,
        [Validators.required],
      ],
      dateNaissance: [this.usager.options.procuration.dateNaissance],
      nom: [this.usager.options.procuration.nom, [Validators.required]],
      prenom: [this.usager.options.procuration.prenom, [Validators.required]],
    });

    this.usagerForm = this.formBuilder.group({
      ayantsDroits: this.formBuilder.array([]),
      ayantsDroitsExist: [this.usager.ayantsDroitsExist, []],
      customId: [this.usager.customId, []],
      dateNaissance: [this.usager.dateNaissance, []],
      dateNaissancePicker: [
        this.usager.dateNaissancePicker,
        [Validators.required],
      ],
      email: [this.usager.email, [Validators.email]],
      id: [this.usager.id, []],
      nom: [this.usager.nom, Validators.required],
      phone: [this.usager.phone, [Validators.pattern(regexp.phone)]],
      prenom: [this.usager.prenom, Validators.required],
      sexe: [this.usager.sexe, Validators.required],
      structure: [this.usager.structure, []],
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
      const dateTmp = this.nbgDate.formatEn(
        this.usagerForm.controls.dateNaissancePicker.value
      );

      if (dateTmp === null) {
        this.notifService.error("La date de naissance semble incorrecte.");
        return;
      }

      this.usagerForm.controls.dateNaissance.setValue(
        new Date(dateTmp).toISOString()
      );

      this.usagerService.create(this.usagerForm.value).subscribe(
        (usager: Usager) => {
          this.submitted = false;
          this.notifService.success("Enregistrement réussi");
          this.usager = usager;
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
    this.usagerService.renouvellement(this.usager.id).subscribe(
      (usager: Usager) => {
        this.usager = usager;
        this.modalService.dismissAll();
        this.router.navigate(["usager/" + usager.id + "/edit"]);
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

  public deleteInteraction(idInteraction: string) {
    this.matomo.trackEvent("tests", "delete_interaction_profil", "null", 1);
    this.interactionService
      .delete(this.usager.id, idInteraction)
      .subscribe((result: any) => {
        if (result && result.ok) {
          this.getInteractions();
        }
      });
  }

  public deleteUsager() {
    this.usagerService.delete(this.usager.id).subscribe(
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
          (usager: Usager) => {
            this.notifService.success(interactionsLabels[item]);
            this.usager = usager;
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

    this.interactionService.setInteraction(this.usager, interaction).subscribe(
      (usager: Usager) => {
        this.usager = usager;
        this.notifService.success(interactionsLabels[type]);
        this.usager.lastInteraction = usager.lastInteraction;
        this.getInteractions();
      },
      (error) => {
        this.notifService.error("Impossible d'enregistrer cette interaction");
      }
    );
  }

  public getAttestation() {
    return this.usagerService.attestation(this.usager.id);
  }

  public getDocument(i: number) {
    return this.documentService.getDocument(
      this.usager.id,
      i,
      this.usager.docs[i]
    );
  }

  public deleteDocument(i: number): void {
    this.documentService.deleteDocument(this.usager.id, i).subscribe(
      (usager: Usager) => {
        this.usager.docs = usager.docs;
      },
      () => {
        this.notifService.error("Impossible de supprimer le document");
      }
    );
  }

  public editTransfert() {
    const dateTmp = this.nbgDate.formatEn(
      this.transfertForm.controls.dateFinPicker.value
    );

    if (dateTmp === null) {
      this.notifService.error("La date de fin du transfert est incorrecte.");
      return;
    }

    this.transfertForm.controls.dateFin.setValue(
      new Date(dateTmp).toISOString()
    );
    this.usagerService
      .editTransfert(this.transfertForm.value, this.usager.id)
      .subscribe(
        (usager: any) => {
          this.editTransfertForm = false;
          this.usager.options = new Options(usager.options);
          this.notifService.success("Transfert ajouté avec succès");
        },
        (error) => {
          this.notifService.error("Impossible d'ajouter le transfert'");
        }
      );
  }

  public editProcuration() {
    const dateTmp = this.nbgDate.formatEn(
      this.procurationForm.controls.dateFinPicker.value
    );
    const dateNaissanceTmp = this.nbgDate.formatEn(
      this.procurationForm.controls.dateNaissancePicker.value
    );

    if (dateTmp === null || dateNaissanceTmp === null) {
      this.notifService.error(
        "Vérifier la date de naissance ou la date de fin de procuration."
      );
      return;
    }

    this.procurationForm.controls.dateFin.setValue(
      new Date(dateTmp).toISOString()
    );

    this.procurationForm.controls.dateNaissance.setValue(
      new Date(dateNaissanceTmp).toISOString()
    );

    this.usagerService
      .editProcuration(this.procurationForm.value, this.usager.id)
      .subscribe(
        (usager: any) => {
          this.editProcurationForm = false;
          this.usager.options = new Options(usager.options);
          this.notifService.success("Procuration ajoutée avec succès");
        },
        (error) => {
          this.notifService.error("Impossible d'ajouter la procuration'");
        }
      );
  }

  public stopCourrier() {
    this.usagerService.stopCourrier(this.usager.id).subscribe(
      (usager: Usager) => {
        this.editTransfertForm = false;
        this.transfertForm.reset();
        this.usager.options = new Options(usager.options);
        this.notifService.success("Pli non distribuable enregistré");
      },
      (error) => {
        this.notifService.error("Cette opération a échoué");
      }
    );
  }

  public deleteProcuration() {
    this.usagerService.deleteProcuration(this.usager.id).subscribe(
      (usager: any) => {
        this.editTransfertForm = false;
        this.procurationForm.reset();
        this.usager.options = new Options(usager.options);
        this.notifService.success("Procuration supprimée avec succès");
      },
      (error) => {
        this.notifService.error("Impossible de supprimer la fiche");
      }
    );
  }

  public deleteTransfert() {
    this.usagerService.deleteTransfert(this.usager.id).subscribe(
      (usager: any) => {
        this.editTransfertForm = false;
        this.transfertForm.reset();
        this.usager.options = new Options(usager.options);
        this.notifService.success("Transfert supprimé avec succès");
      },
      (error) => {
        this.notifService.error("Impossible de supprimer la fiche");
      }
    );
  }

  public closeModal() {
    this.modalService.dismissAll();
  }

  private getInteractions() {
    this.interactionService
      .getInteractions(this.usager.id)
      .subscribe((interactions: Interaction[]) => {
        this.interactions = interactions;
      });
  }
}
