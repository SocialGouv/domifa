import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { StructureCommon, UserStructure } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { StructureService } from "../../services/structure.service";

@Component({
  selector: "app-structures-portail-usager-form",
  templateUrl: "./structures-portail-usager-form.component.html",
  styleUrls: ["./structures-portail-usager-form.component.css"],
})
export class StructuresPortailUsagerFormComponent implements OnInit {
  public me: UserStructure;
  public structure: StructureCommon;

  public submitted: boolean;
  public structurePortailUsagerForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private structureService: StructureService,
    private notifService: ToastrService,
    private authService: AuthService,
    private titleService: Title
  ) {
    this.me = null;
    this.structure = null;
    this.submitted = false;
  }

  get form() {
    return this.structurePortailUsagerForm.controls;
  }

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    this.titleService.setTitle("Paramétrer le portail usager");

    this.structureService.findMyStructure().subscribe(
      (structure: StructureCommon) => {
        this.structure = structure;

        this.initForm();
      },
      () => {
        this.notifService.success(
          "Impossible de récupérer les infos de ma structure"
        );
      }
    );
  }

  public initForm() {
    this.structurePortailUsagerForm = this.formBuilder.group({
      enabledByStructure: [
        this.structure.portailUsager.enabledByStructure,
        [Validators.required],
      ],
    });
  }

  public submitStructureSmsForm() {
    this.submitted = true;

    if (this.structurePortailUsagerForm.invalid) {
      this.notifService.error("Veuillez vérifier le formulaire");
    } else {
      this.structureService
        .patchPortailUsagerParams(this.structurePortailUsagerForm.value)
        .subscribe(
          (retour: any) => {
            this.submitted = false;
            this.notifService.success(
              "Paramètres du portail usager mis à jour avec succès"
            );
          },
          (error: any) => {
            this.submitted = false;
            this.notifService.error(
              "Impossible de mettre à jour les paramètres"
            );
          }
        );
    }
  }
}
