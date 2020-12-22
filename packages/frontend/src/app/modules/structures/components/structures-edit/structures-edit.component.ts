import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";

import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AppUser } from "../../../../../_common/model";
import { Structure } from "../../structure.interface";

import { StructureService } from "../../services/structure.service";
import { AuthService } from "src/app/modules/shared/services/auth.service";

@Component({
  selector: "app-structures-edit",
  styleUrls: ["./structures-edit.component.css"],
  templateUrl: "./structures-edit.component.html",
})
export class StructuresEditComponent implements OnInit {
  public me: AppUser;
  public structure: Structure;

  public modal: any;

  public exportLoading: boolean;

  public showHardReset: boolean;
  public hardResetCode: boolean;
  public hardResetForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private structureService: StructureService,
    private notifService: ToastrService,
    public authService: AuthService,
    public modalService: NgbModal,
    private titleService: Title
  ) {
    this.showHardReset = false;
    this.hardResetCode = null;

    this.authService.currentUser.subscribe((user: AppUser) => {
      this.me = user;
    });
  }

  get h() {
    return this.hardResetForm.controls;
  }

  public ngOnInit() {
    this.titleService.setTitle("Structure");

    this.structureService
      .findMyStructure()
      .subscribe((structure: Structure) => {
        this.structure = structure;
        this.initForms();
      });
  }

  public initForms() {
    this.hardResetForm = this.formBuilder.group({
      token: ["", [Validators.required]],
    });
  }

  public open(content: TemplateRef<any>) {
    this.modal = this.modalService.open(content);
  }

  public hardReset() {
    this.structureService.hardReset().subscribe((retour: any) => {
      this.showHardReset = true;
    });
  }

  public hardResetConfirm() {
    if (this.hardResetForm.invalid) {
      this.notifService.error("Veuillez vérifier le formulaire");
    } else {
      this.structureService
        .hardResetConfirm(this.hardResetForm.controls.token.value)
        .subscribe(
          (retour: any) => {
            this.notifService.success(
              "La remise à zéro a été effectuée avec succès !"
            );
            this.modalService.dismissAll();
            this.showHardReset = false;
          },
          (error: any) => {
            this.notifService.error(
              "La remise à zéro n'a pas pu être effectuée !"
            );
          }
        );
    }
  }

  public export() {
    this.exportLoading = true;
    this.structureService.export().subscribe(
      (x: any) => {
        const newBlob = new Blob([x], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(newBlob, "export_domifa" + ".xlsx");
        setTimeout(() => {
          this.exportLoading = false;
        }, 500);
      },
      (error: any) => {
        this.notifService.error(
          "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
        );
        this.exportLoading = false;
      }
    );
  }
}
