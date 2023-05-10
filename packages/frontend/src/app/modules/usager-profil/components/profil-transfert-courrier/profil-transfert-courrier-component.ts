import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
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
import {
  UsagerLight,
  UserStructure,
  UserStructureRole,
} from "../../../../../_common/model";
import {
  endDateAfterBeginDateValidator,
  noWhiteSpace,
} from "../../../../shared";
import {
  formatDateToNgb,
  minDateToday,
} from "../../../../shared/bootstrap-util";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";
import { CustomDatepickerI18n } from "../../../shared/services/date-french";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerOptionsService } from "./../../services/usager-options.service";

@Component({
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-profil-transfert-courrier",
  styleUrls: ["./profil-transfert-courrier.css"],
  templateUrl: "./profil-transfert-courrier.html",
})
export class UsagersProfilTransfertCourrierComponent
  implements OnInit, OnDestroy
{
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  @Output() public usagerChange = new EventEmitter<UsagerFormModel>();

  public isFormVisible: boolean;
  public loading: boolean;
  public submitted: boolean;

  public transfertForm!: UntypedFormGroup;
  public minDateToday: NgbDateStruct;

  @ViewChild("confirmDelete", { static: true })
  public confirmDelete!: TemplateRef<NgbModalRef>;

  private subscription = new Subscription();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly nbgDate: NgbDateCustomParserFormatter,
    private readonly toastService: CustomToastService,
    private readonly usagerOptionsService: UsagerOptionsService,
    private readonly matomo: MatomoTracker,
    private readonly modalService: NgbModal
  ) {
    this.isFormVisible = false;
    this.loading = false;
    this.submitted = false;
    this.minDateToday = minDateToday;
  }

  public ngOnInit(): void {
    this.initForm();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.transfertForm.controls;
  }

  public showForm(): void {
    this.isFormVisible = true;
    this.initForm();
    this.transfertForm.reset(this.transfertForm.value);
  }

  public hideForm(): void {
    this.submitted = false;
    this.loading = false;
    this.isFormVisible = false;
    this.transfertForm.reset(this.transfertForm.value);
  }

  public isRole(role: UserStructureRole): boolean {
    return this.me.role === role;
  }

  public initForm(): void {
    this.transfertForm = this.formBuilder.group(
      {
        nom: [
          this.usager.options.transfert.nom,
          [Validators.required, noWhiteSpace],
        ],
        adresse: [
          this.usager.options.transfert.adresse,
          [Validators.required, Validators.minLength(10), noWhiteSpace],
        ],
        dateFin: [
          this.usager.options.transfert.dateFin
            ? formatDateToNgb(this.usager.options.transfert.dateFin)
            : null,
          [Validators.required],
        ],
        dateDebut: [
          this.usager.options.transfert.dateDebut
            ? formatDateToNgb(this.usager.options.transfert.dateDebut)
            : null,
          [Validators.required],
        ],
      },
      {
        validators: endDateAfterBeginDateValidator,
      }
    );
  }

  public editTransfert(): void {
    this.submitted = true;
    if (this.transfertForm.invalid) {
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }

    const formValue = {
      ...this.transfertForm.value,
      dateFin: new Date(
        this.nbgDate.formatEn(this.transfertForm.controls.dateFin.value)
      ),
      dateDebut: new Date(
        this.nbgDate.formatEn(this.transfertForm.controls.dateDebut.value)
      ),
    };

    this.loading = true;

    this.subscription.add(
      this.usagerOptionsService
        .editTransfert(formValue, this.usager.ref)
        .subscribe({
          next: (usager: UsagerLight) => {
            this.hideForm();
            this.matomo.trackEvent("profil", "actions", "edit_transfert", 1);
            this.usager = new UsagerFormModel(usager);
            this.usagerChange.emit(this.usager);

            this.toastService.success("Transfert modifié avec succès");
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible d'ajouter le transfert'");
          },
        })
    );
  }

  public openConfirmation(): void {
    this.modalService.open(this.confirmDelete);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public deleteTransfert(): void {
    if (!this.usager.options.transfert.actif) {
      this.hideForm();
      return;
    }

    this.loading = true;

    this.subscription.add(
      this.usagerOptionsService.deleteTransfert(this.usager.ref).subscribe({
        next: (usager: UsagerLight) => {
          this.toastService.success("Transfert supprimé avec succès");

          setTimeout(() => {
            this.closeModals();
            this.hideForm();
            this.transfertForm.reset();
            this.submitted = false;
            this.usager = new UsagerFormModel(usager);
            this.usagerChange.emit(this.usager);
            this.matomo.trackEvent("profil", "actions", "delete_transfert", 1);
          }, 500);
        },
        error: () => {
          this.toastService.error("Impossible de supprimer le transfert");
        },
      })
    );
  }
}
