import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import fileSaver from "file-saver";
import { ToastrService } from "ngx-toastr";
import {
  StructureDocTypesAvailable,
  UserStructure,
  UserStructureRole,
} from "../../../../../_common/model";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { DocumentService } from "../../../usager-shared/services/document.service";
import { UsagerProfilService } from "../../services/usager-profil.service";

@Component({
  selector: "app-profil-edit-portail-usager-preference",
  templateUrl: "./profil-edit-portail-usager-preference.component.html",
  styleUrls: ["./profil-edit-portail-usager-preference.component.css"],
})
export class ProfilEditPortailUsagerPreferenceComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  @Input() public me: UserStructure;

  public submitted: boolean;
  public form: FormGroup;

  public editionInProgress: boolean;
  public loadings: string[] = [];

  public loginToDisplay?: {
    login: string;
    temporaryPassword: string;
  };

  constructor(
    private formBuilder: FormBuilder,
    private notifService: ToastrService,
    private usagerProfilService: UsagerProfilService,
    private documentService: DocumentService
  ) {
    this.submitted = false;
    this.me = null;
    this.usager = null;
    this.editionInProgress = false;
  }

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      portailUsagerEnabled: [
        this.usager.options?.portailUsagerEnabled,
        [Validators.required],
      ],
      generateNewPassword: [!this.usager.options?.portailUsagerEnabled, []],
    });
  }

  private stopLoading(loadingRef: string) {
    const index = this.loadings.indexOf(loadingRef);
    if (index !== -1) {
      this.loadings.splice(index, 1);
    }
  }

  public isRole(role: UserStructureRole) {
    return this.me?.role === role;
  }

  public getDomifaCustomDoc(): void {
    const docType: StructureDocTypesAvailable = "acces_espace_domicilie";
    this.loadings.push(docType);

    this.documentService
      .getDomifaCustomDoc({
        usagerId: this.usager.ref,
        docType,
        extraUrlParameters: {
          ESPACE_DOM_ID: this.loginToDisplay.login,
          ESPACE_DOM_MDP: this.loginToDisplay.temporaryPassword,
        },
      })
      .subscribe({
        next: (blob: Blob) => {
          const newBlob = new Blob([blob], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          fileSaver.saveAs(newBlob, docType + ".docx");

          this.stopLoading(docType);
        },
        error: () => {
          this.stopLoading(docType);
        },
      });
  }

  public submit() {
    this.submitted = true;
    if (this.form.invalid) {
      this.notifService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
    } else {
      this.usagerProfilService
        .updatePortailUsagerOptions({
          usagerRef: this.usager.ref,
          options: {
            portailUsagerEnabled: this.form.value.portailUsagerEnabled,
            generateNewPassword:
              this.form.value.portailUsagerEnabled &&
              this.form.value.generateNewPassword,
          },
        })
        .subscribe(
          ({ usager, login, temporaryPassword }) => {
            if (login && temporaryPassword) {
              this.loginToDisplay = {
                login,
                temporaryPassword,
              };
            } else {
              this.loginToDisplay = undefined;
            }
            this.submitted = false;
            this.editionInProgress = false;
            this.notifService.success("Enregistrement des préférences réussi");
            this.usager = new UsagerFormModel(usager);
          },
          () => {
            this.notifService.error(
              "Veuillez vérifier les champs du formulaire"
            );
          }
        );
    }
  }
}
