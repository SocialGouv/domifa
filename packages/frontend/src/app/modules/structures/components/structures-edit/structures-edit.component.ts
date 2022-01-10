import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import * as fileSaver from "file-saver";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { StructureCommon, UserStructure } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { StructureService } from "../../services/structure.service";

@Component({
  selector: "app-structures-edit",
  styleUrls: ["./structures-edit.component.css"],
  templateUrl: "./structures-edit.component.html",
})
export class StructuresEditComponent implements OnInit {
  public me: UserStructure;
  public structure: StructureCommon;

  public exportLoading: boolean;
  public showHardReset: boolean;
  public hardResetCode: boolean;

  public hardResetForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private structureService: StructureService,
    private toastService: CustomToastService,
    private authService: AuthService,
    private modalService: NgbModal,
    private titleService: Title
  ) {
    this.showHardReset = false;
    this.hardResetCode = null;
  }

  get h() {
    return this.hardResetForm.controls;
  }

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    this.titleService.setTitle("Structure");

    this.structureService
      .findMyStructure()
      .subscribe((structure: StructureCommon) => {
        this.structure = structure;
        this.initForms();
      });
  }

  public initForms() {
    this.hardResetForm = this.formBuilder.group({
      token: ["", [Validators.required]],
    });
  }

  public open(content: TemplateRef<NgbModalRef>) {
    this.modalService.open(content);
  }

  public closeModals() {
    this.modalService.dismissAll();
  }

  public hardReset() {
    this.structureService.hardReset().subscribe(() => {
      this.showHardReset = true;
    });
  }

  public hardResetConfirm() {
    if (this.hardResetForm.invalid) {
      this.toastService.error("Veuillez vérifier le formulaire");
    } else {
      this.structureService
        .hardResetConfirm(this.hardResetForm.controls.token.value)
        .subscribe(
          () => {
            this.toastService.success(
              "La remise à zéro a été effectuée avec succès !"
            );
            this.closeModals();
            this.showHardReset = false;
          },
          () => {
            this.toastService.error(
              "La remise à zéro n'a pas pu être effectuée !"
            );
          }
        );
    }
  }

  public export() {
    this.exportLoading = true;
    this.structureService.export().subscribe({
      next: (x: Blob) => {
        const newBlob = new Blob([x], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        fileSaver.saveAs(newBlob, "export_domifa" + ".xlsx");
        setTimeout(() => {
          this.exportLoading = false;
        }, 500);
      },
      error: () => {
        this.toastService.error(
          "Une erreur inattendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
        this.exportLoading = false;
      },
    });
  }
}
