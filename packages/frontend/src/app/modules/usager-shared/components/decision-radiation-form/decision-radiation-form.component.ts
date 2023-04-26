import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  AbstractControl,
  Validators,
} from "@angular/forms";
import {
  NgbDateStruct,
  NgbModal,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { Observable, Subscription, forkJoin } from "rxjs";
import {
  MOTIFS_RADIATION_LABELS,
  UsagerDecisionRadiationForm,
} from "../../../../../_common/model";
import { minDateToday } from "../../../../shared";
import {
  NgbDateCustomParserFormatter,
  CustomToastService,
} from "../../../shared/services";
import { UsagerFormModel } from "../../interfaces";
import { UsagerDecisionService } from "../../services/usager-decision.service";

@Component({
  selector: "app-decision-radiation-form",
  styleUrls: ["./decision-radiation-form.component.scss"],
  templateUrl: "./decision-radiation-form.component.html",
})
export class DecisionRadiationFormComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public selectedRefs: number[];
  @Input() public context!: "MANAGE" | "PROFIL";

  @Output() public usagerChange = new EventEmitter<UsagerFormModel>();

  public submitted: boolean;
  public loading: boolean;
  public radiationForm!: UntypedFormGroup;

  public readonly MOTIFS_RADIATION_LABELS = MOTIFS_RADIATION_LABELS;

  public minDate: NgbDateStruct;
  public maxDate: NgbDateStruct;

  private subscription = new Subscription();

  @ViewChild("decisionRadiationFormModal", { static: true })
  public decisionRadiationFormModal!: TemplateRef<NgbModalRef>;

  constructor(
    private readonly modalService: NgbModal,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly nbgDate: NgbDateCustomParserFormatter,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly toastService: CustomToastService
  ) {
    this.submitted = false;
    this.loading = false;
    this.minDate = { day: 1, month: 1, year: new Date().getFullYear() - 1 };
    this.maxDate = minDateToday;
    this.selectedRefs = [];
  }

  public get r(): { [key: string]: AbstractControl } {
    return this.radiationForm.controls;
  }

  public ngOnInit(): void {
    this.radiationForm = this.formBuilder.group({
      motif: [null, [Validators.required]],
      dateFin: [null, [Validators.required]],
      statut: ["RADIE", [Validators.required]],
      motifDetails: [null, []],
    });

    this.subscription.add(
      this.radiationForm.get("motif")?.valueChanges.subscribe((value) => {
        if (value === "AUTRE") {
          this.radiationForm
            .get("motifDetails")
            ?.setValidators([Validators.required, Validators.minLength(10)]);
        } else {
          this.radiationForm.get("motifDetails")?.setValidators(null);
          this.radiationForm.get("motifDetails")?.setValue(null);
        }
      })
    );
  }

  public setDecisionRadiation(): void {
    this.submitted = true;

    if (this.radiationForm.invalid) {
      this.toastService.error(
        "Le formulaire contient une erreur, veuillez vérifier les champs"
      );
    } else {
      const formDatas: UsagerDecisionRadiationForm = {
        ...this.radiationForm.value,
        dateFin: new Date(
          this.nbgDate.formatEn(this.radiationForm.controls.dateFin.value)
        ),
      };

      this.setDecision(formDatas);
    }
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public openRadiationModal(): void {
    this.modalService.open(this.decisionRadiationFormModal);
  }

  public setDecision(formDatas: UsagerDecisionRadiationForm): void {
    this.loading = true;
    if (this.usager) {
      this.selectedRefs = [this.usager.ref];
    }

    console.log(this.selectedRefs);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleteRequests: Observable<any>[] = this.selectedRefs.map(
      (ref: number) => {
        return this.usagerDecisionService.setDecision(ref, formDatas);
      }
    );

    this.subscription.add(
      forkJoin(deleteRequests).subscribe({
        next: () => {
          this.modalService.dismissAll();
          const message =
            this.selectedRefs.length > 1
              ? "Les dossiers sélectionnés ont été radié"
              : "Radiation enregistrée avec succès ! ";
          this.toastService.success(message);
          setTimeout(() => {
            this.loading = false;
            window.location.reload();
          }, 1000);
        },
        error: () => {
          this.loading = false;
          this.toastService.error("La décision n'a pas pu être enregistrée");
          window.location.reload();
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
