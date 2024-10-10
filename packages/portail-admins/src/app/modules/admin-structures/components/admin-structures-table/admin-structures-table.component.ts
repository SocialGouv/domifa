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
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { of, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { regexp } from "../../../../shared/utils";
import { AdminStructuresApiClient } from "../../../shared/services";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import {
  AdminStructuresListStructureModel,
  AdminStructuresListSortAttribute,
} from "../../model";

@Component({
  selector: "app-admin-structures-table",
  templateUrl: "./admin-structures-table.component.html",
  styleUrls: ["./admin-structures-table.component.css"],
})
export class AdminStructuresTableComponent implements OnInit, OnDestroy {
  @Input()
  public structuresVM?: AdminStructuresListStructureModel[] = [];

  @Output()
  public readonly sort = new EventEmitter<{
    name: AdminStructuresListSortAttribute;
    defaultSort: "asc" | "desc";
  }>();

  @ViewChild("addAdminModal", { static: true })
  public addAdminModal!: TemplateRef<NgbModalRef>;

  public currentStructure: AdminStructuresListStructureModel | undefined =
    undefined;

  public newAdminForm!: UntypedFormGroup;

  public submitted = false;

  public loading = false;
  public exportLoading = false;

  private subscription = new Subscription();

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
      email: [
        null,
        [Validators.required, Validators.pattern(regexp.email)],
        this.validateEmailNotTaken.bind(this),
      ],
    });
  }

  public sortDashboard(
    name: AdminStructuresListSortAttribute,
    defaultSort: "asc" | "desc" = "asc"
  ): void {
    this.sort.emit({
      name,
      defaultSort,
    });
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

  public openModal(structure: AdminStructuresListStructureModel): void {
    this.currentStructure = structure;
    this.modalService.open(this.addAdminModal, { size: "lg" });
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
        .postNewAdmin({
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
    this.submitted = false;
    this.modalService.dismissAll();
  }

  public validateEmailNotTaken(control: AbstractControl) {
    const testEmail = RegExp(regexp.email).test(control.value);
    return testEmail
      ? this.adminStructuresApiClient.validateEmail(control.value).pipe(
          map((res: boolean) => {
            return res === false ? null : { emailTaken: true };
          })
        )
      : of(null);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
