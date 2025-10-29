import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  TemplateRef,
  OnDestroy,
} from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  AbstractControl,
  Validators,
} from "@angular/forms";
import { SortValues, USER_FONCTION_LABELS } from "@domifa/common";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { regexp } from "../../../../shared";
import {
  AdminStructuresApiClient,
  CustomToastService,
} from "../../../shared/services";
import { StructureAdmin } from "../../types";
import { StructureFilterCriteria } from "../../utils";
import { FilterOutput } from "../admin-structures-list/admin-structures-list.component";

@Component({
  selector: "app-admin-structures-table",
  templateUrl: "./admin-structures-table.component.html",
  styleUrls: ["./admin-structures-table.component.scss"],
})
export class AdminStructuresTableComponent implements OnInit, OnDestroy {
  @Input()
  public structures?: StructureAdmin[] = [];
  @Input()
  public filters!: StructureFilterCriteria;

  @Output()
  public readonly sort = new EventEmitter<FilterOutput>();

  @ViewChild("addAdminModal", { static: true })
  public addAdminModal!: TemplateRef<NgbModalRef>;

  public currentStructure: StructureAdmin | undefined = undefined;
  public structureToDelete: StructureAdmin | undefined = undefined;
  public structureToRefuse: StructureAdmin | undefined = undefined;

  public newAdminForm!: UntypedFormGroup;

  public submitted = false;

  public loading = false;
  public exportLoading = false;
  public sortValue: SortValues = "desc";
  public currentKey: keyof StructureAdmin = "id";
  private readonly subscription = new Subscription();
  public readonly USER_FONCTION_LABELS = USER_FONCTION_LABELS;

  constructor(
    private readonly adminStructuresApiClient: AdminStructuresApiClient,
    private readonly toastService: CustomToastService,
    private readonly modalService: NgbModal,
    private readonly formBuilder: UntypedFormBuilder
  ) {}

  get f(): { [key: string]: AbstractControl } {
    return this.newAdminForm.controls;
  }

  public ngOnInit(): void {
    this.newAdminForm = this.formBuilder.group({
      nom: [null, [Validators.required]],
      prenom: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.pattern(regexp.email)]],
      fonction: [null, [Validators.required]],
      fonctionDetail: [
        null,
        [Validators.minLength(2), Validators.maxLength(255)],
      ],
    });
  }

  public idTrackBy(_index: number, item: StructureAdmin) {
    return item.id;
  }

  public get fonctionFormControl(): AbstractControl {
    return this.newAdminForm.get("fonction");
  }

  public get fonctionDetailControl(): AbstractControl {
    return this.newAdminForm.get("fonctionDetail");
  }

  public test(structure: StructureAdmin) {
    console.log({ structure });
  }
  public refuseModal(structure: StructureAdmin) {
    this.structureToRefuse = structure;
  }
  public openDeleteModal(structure: StructureAdmin) {
    this.structureToDelete = structure;
  }

  public deleteStructure(structureUuid: string): void {
    this.subscription.add(
      this.adminStructuresApiClient
        .deleteSendInitialMail(structureUuid)
        .subscribe({
          next: () => {
            this.toastService.success(
              "Vous venez de recevoir un email vous permettant de supprimer la structure"
            );
          },
          error: () => {
            this.toastService.error(
              "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
            );
          },
        })
    );
  }

  public confirmStructure(structure: StructureAdmin) {
    this.subscription.add(
      this.adminStructuresApiClient
        .setDecisionStructure(structure.id, "VALIDE")
        .subscribe({
          next: () => {
            structure.statut = "VALIDE";
            this.toastService.success("Structure vérifiée avec succès");
          },
          error: () => {
            this.toastService.error("Impossible de valider la structure");
          },
        })
    );
  }

  public openAddAdminModal(structure: StructureAdmin): void {
    this.modalService.open(this.addAdminModal);
    this.currentStructure = structure;
  }

  public submitNewAdmin(): void {
    this.submitted = true;

    if (this.newAdminForm.invalid) {
      this.toastService.error("Veuillez vérifier le formulaire");
      return;
    }

    this.loading = true;
    this.subscription.add(
      this.adminStructuresApiClient
        .registerUserStructureAdmin({
          ...this.newAdminForm.value,
          structureId: this.currentStructure?.id,
          structure: this.currentStructure,
          role: "admin",
        })
        .subscribe({
          next: () => {
            this.newAdminForm.reset();
            this.submitted = false;
            this.loading = false;

            this.currentStructure = undefined;
            this.modalService.dismissAll();
            this.toastService.success("Un email a été envoyé à l'utilisateur.");
          },
          error: () => {
            this.loading = false;
            this.submitted = false;
            this.toastService.error("Une erreur est survenue.");
          },
        })
    );
  }

  public cancelForm(): void {
    this.newAdminForm.reset();
    this.currentStructure = undefined;
    this.structureToDelete = undefined;
    this.structureToRefuse = undefined;
    this.submitted = false;
    this.modalService.dismissAll();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
