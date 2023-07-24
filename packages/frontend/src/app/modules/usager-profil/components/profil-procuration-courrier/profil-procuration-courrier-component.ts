import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbModal,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { MatomoTracker } from "@ngx-matomo/tracker";
import { Subscription } from "rxjs";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter.service";
import {
  UserStructure,
  UserStructureRole,
  UsagerOptionsProcuration,
} from "../../../../../_common/model";
import {
  endDateAfterBeginDateValidator,
  noWhiteSpace,
} from "../../../../shared";
import {
  minDateToday,
  minDateNaissance,
  formatDateToNgb,
} from "../../../../shared/bootstrap-util";

import { CustomDatepickerI18n } from "../../../shared/services/date-french.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerProcuration } from "../../../usager-shared/interfaces/UsagerProcuration.interface";
import { UsagerOptionsService } from "../../services/usager-options.service";
@Component({
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-profil-procuration-courrier",
  templateUrl: "./profil-procuration-courrier.html",
})
export class UsagersProfilProcurationCourrierComponent
  implements OnInit, OnDestroy
{
  @Input() public usager!: UsagerFormModel;

  @Input() public me!: UserStructure;
  private subscription = new Subscription();

  @ViewChildren("procurationNom")
  public inputsProcurations!: QueryList<ElementRef>;

  public isFormVisible: boolean;
  public submitted: boolean;
  public procurationToDelete: number | null; // Index de la procu à supprimer

  public procurationsForm!: UntypedFormGroup;
  public minDateToday: NgbDateStruct;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  public loading = false;

  @ViewChild("confirmDelete", { static: true })
  public confirmDelete!: TemplateRef<NgbModalRef>;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly nbgDate: NgbDateCustomParserFormatter,
    private readonly toastService: CustomToastService,
    private readonly usagerOptionsService: UsagerOptionsService,
    private readonly matomo: MatomoTracker,
    private readonly modalService: NgbModal
  ) {
    this.hideForm();
    this.submitted = false;
    this.isFormVisible = false;
    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.procurationToDelete = null;
    this.maxDateNaissance = minDateToday;
  }

  public isRole(role: UserStructureRole): boolean {
    return this.me?.role === role;
  }

  public ngOnInit(): void {
    this.procurationsForm = this.formBuilder.group({
      procurations: this.formBuilder.array([]),
    });
  }

  public get form(): UntypedFormArray {
    return this.procurationsForm.get("procurations") as UntypedFormArray;
  }

  public hideForm(): void {
    this.submitted = false;
    this.loading = false;
    this.isFormVisible = false;
  }

  public addProcuration(
    procuration: UsagerProcuration = new UsagerProcuration()
  ): void {
    (this.procurationsForm.controls.procurations as UntypedFormArray).push(
      this.newProcuration(procuration)
    );
    this.submitted = false;
  }

  public initForm(): void {
    this.isFormVisible = true;

    this.procurationsForm = this.formBuilder.group({
      procurations: this.formBuilder.array([]),
    });

    if (this.usager.options.procurations.length > 0) {
      for (const procuration of this.usager.options.procurations) {
        this.addProcuration(procuration);
      }
    } else {
      this.addProcuration();
    }
  }

  public newProcuration(procuration: UsagerOptionsProcuration) {
    return new UntypedFormGroup(
      {
        nom: new UntypedFormControl(procuration.nom, [
          Validators.required,
          noWhiteSpace,
        ]),
        prenom: new UntypedFormControl(procuration.prenom, [
          Validators.required,
          noWhiteSpace,
        ]),
        dateFin: new UntypedFormControl(formatDateToNgb(procuration.dateFin), [
          Validators.required,
        ]),
        dateDebut: new UntypedFormControl(
          formatDateToNgb(procuration.dateDebut),
          [Validators.required]
        ),
        dateNaissance: new UntypedFormControl(
          formatDateToNgb(
            procuration.dateNaissance
              ? new Date(procuration.dateNaissance)
              : null
          ),
          [Validators.required]
        ),
      },
      {
        validators: endDateAfterBeginDateValidator,
      }
    );
  }

  public editProcurations(): void {
    this.submitted = true;

    if (this.procurationsForm.invalid) {
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }

    const procurationFormData: UsagerOptionsProcuration[] = this.form.value.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (procuration: any) => {
        return {
          nom: procuration.nom,
          prenom: procuration.prenom,
          dateFin: this.nbgDate.formatEn(procuration.dateFin),
          dateDebut: this.nbgDate.formatEn(procuration.dateDebut),
          dateNaissance: this.nbgDate.formatEn(procuration.dateNaissance),
        };
      }
    );

    this.loading = true;
    this.subscription.add(
      this.usagerOptionsService
        .editProcurations(procurationFormData, this.usager.ref)
        .subscribe({
          next: () => {
            this.hideForm();

            this.toastService.success("Procuration modifiée avec succès");
            this.matomo.trackEvent("profil", "actions", "edit_procuration", 1);
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible d'ajouter la procuration'");
          },
        })
    );
  }

  public openConfirmation(index: number): void {
    this.procurationToDelete = index;
    this.modalService.open(this.confirmDelete);
  }

  public deleteProcurationForm(i: number): void {
    this.form.removeAt(i);
    if (this.form.length === 0) {
      this.isFormVisible = false;
    }
  }

  public deleteProcuration(procurationToDelete: number): void {
    this.subscription.add(
      this.usagerOptionsService
        .deleteProcuration(this.usager.ref, procurationToDelete)
        .subscribe({
          next: () => {
            this.toastService.success("Procuration supprimée avec succès");

            setTimeout(() => {
              this.closeModals();
              this.hideForm();
              this.procurationsForm.reset();

              this.matomo.trackEvent(
                "profil",
                "actions",
                "delete-procuration",
                1
              );
            }, 500);
          },
          error: () => {
            this.toastService.error("Impossible de supprimer la procuration");
          },
        })
    );
  }

  public closeModals(): void {
    this.procurationToDelete = null;
    this.submitted = false;
    this.modalService.dismissAll();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
