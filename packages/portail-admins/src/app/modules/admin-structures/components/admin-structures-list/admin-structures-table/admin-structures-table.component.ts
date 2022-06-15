import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  TemplateRef,
} from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { of } from "rxjs";
import { map } from "rxjs/operators";

import {
  AdminStructuresApiClient,
  AdminStructuresExportApiClient,
} from "../../../../shared/services";
import { AdminStructuresDeleteApiClient } from "../../../../shared/services/api/admin-structures-delete-api-client.service";
import { CustomToastService } from "../../../../shared/services/custom-toast.service";
import {
  AdminStructuresListSortAttribute,
  AdminStructuresListStructureModel,
} from "../model";
import { UserNewAdmin } from "../../../../../../_common";
import { regexp } from "src/app/shared/validators";

@Component({
  selector: "app-admin-structures-table",
  templateUrl: "./admin-structures-table.component.html",
  styleUrls: ["./admin-structures-table.component.css"],
})
export class AdminStructuresTableComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input()
  public structuresVM?: AdminStructuresListStructureModel[] = [];

  @Output()
  public onSort = new EventEmitter<{
    name: AdminStructuresListSortAttribute;
    defaultSort: "asc" | "desc";
  }>();

  @ViewChild("addAdminModal", { static: true })
  public addAdminModal!: TemplateRef<NgbModalRef>;
  public currentStructure: AdminStructuresListStructureModel | undefined =
    undefined;
  public newAdminForm!: FormGroup;
  public newAdmin: UserNewAdmin = {
    nom: "",
    prenom: "",
    email: "",
    role: "admin",
  };
  public submitted: Boolean = false;

  public exportLoading = false;

  constructor(
    private readonly adminStructuresApiClient: AdminStructuresApiClient,
    private readonly adminStructuresDeleteApiClient: AdminStructuresDeleteApiClient,
    private readonly adminStructuresExportApiClient: AdminStructuresExportApiClient,
    private readonly toastService: CustomToastService,
    public modalService: NgbModal,
    private readonly formBuilder: FormBuilder
  ) {}

  get f(): { [key: string]: AbstractControl } {
    return this.newAdminForm.controls;
  }

  public ngOnInit(): void {
    this.newAdminForm = this.formBuilder.group({
      nom: [this.newAdmin.nom, [Validators.required]],
      prenom: [this.newAdmin.prenom, [Validators.required]],
      email: [
        this.newAdmin.email,
        [Validators.required, Validators.pattern(regexp.email)],
        this.validateEmailNotTaken.bind(this),
      ],
    });
  }

  public ngOnChanges(): void {}

  public ngOnDestroy(): void {}

  public sortDashboard(
    name: AdminStructuresListSortAttribute,
    defaultSort: "asc" | "desc" = "asc"
  ): void {
    this.onSort.emit({
      name,
      defaultSort,
    });
  }

  public deleteStructure(id: number): void {
    this.adminStructuresDeleteApiClient.deleteSendInitialMail(id).subscribe({
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
    });
  }

  public enableSms(structure: AdminStructuresListStructureModel): void {
    this.adminStructuresApiClient.enableSms(structure.id).subscribe({
      next: () => {
        structure.sms.enabledByDomifa = !structure.sms.enabledByDomifa;

        let message = structure.portailUsager.enabledByDomifa
          ? "SMS activés"
          : "SMS désactivés";
        message = message + " pour la structure : " + structure.nom;
        this.toastService.success(message);
      },
      error: () => {
        this.toastService.error(
          "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
      },
    });
  }

  public enablePortailUsager(
    structure: AdminStructuresListStructureModel
  ): void {
    this.adminStructuresApiClient.enablePortailUsager(structure.id).subscribe({
      next: () => {
        structure.portailUsager.enabledByDomifa =
          !structure.portailUsager.enabledByDomifa;

        let message = structure.sms.enabledByDomifa
          ? "Portail usager activé"
          : "Portail usager désactivé";
        message = message + " pour la structure : " + structure.nom;
        this.toastService.success(message);
      },
      error: () => {
        this.toastService.error(
          "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
      },
    });
  }

  public exportYearStats(structureId: number, year: number): void {
    this.exportLoading = true;

    this.adminStructuresExportApiClient
      .exportYearStats({
        structureId,
        year,
      })
      .subscribe({
        error: () => {
          this.toastService.error(
            "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
          );
          this.exportLoading = false;
        },
        complete: () => {
          this.exportLoading = false;
        },
      });
  }

  public openModal(structure: AdminStructuresListStructureModel): void {
    this.currentStructure = structure;
    this.modalService.open(this.addAdminModal, { size: "lg" });
  }

  public submitNewAdmin(): void {
    this.submitted = true;

    if (this.newAdminForm.valid) {
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
            this.modalService.dismissAll();
            this.toastService.success("Un email a été envoyé à l'utilisateur.");
          },
          error: () => {
            this.submitted = false;
            this.toastService.error("Une erreur est survenue.");
          },
        });
    }
  }

  public cancelForm(): void {
    this.newAdminForm.reset();
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
}
