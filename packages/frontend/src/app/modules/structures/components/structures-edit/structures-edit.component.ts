import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { saveAs } from "file-saver";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { AppUser, StructureCommon } from "../../../../../_common/model";
import { StructureService } from "../../services/structure.service";

@Component({
  selector: "app-structures-edit",
  styleUrls: ["./structures-edit.component.css"],
  templateUrl: "./structures-edit.component.html",
})
export class StructuresEditComponent implements OnInit {
  public me: AppUser;
  public structure: StructureCommon;

  public exportLoading: boolean;
  public showHardReset: boolean;
  public hardResetCode: boolean;

  public hardResetForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private structureService: StructureService,
    private notifService: ToastrService,
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

  public ngOnInit() {
    this.authService.currentUserSubject.subscribe((user: AppUser) => {
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

  public open(content: TemplateRef<any>) {
    this.modalService.open(content);
  }

  public closeModals() {
    this.modalService.dismissAll();
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
          () => {
            this.notifService.success(
              "La remise à zéro a été effectuée avec succès !"
            );
            this.closeModals();
            this.showHardReset = false;
          },
          (error) => {
            console.log(error);
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
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
