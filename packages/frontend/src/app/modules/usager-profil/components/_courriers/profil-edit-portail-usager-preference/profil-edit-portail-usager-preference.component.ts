import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { saveAs } from "file-saver";
import { Subscription } from "rxjs";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { StructureDocTypesAvailable } from "../../../../../../_common/model";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { DocumentService } from "../../../../usager-shared/services/document.service";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { UserStructure } from "@domifa/common";

@Component({
  selector: "app-profil-edit-portail-usager-preference",
  templateUrl: "./profil-edit-portail-usager-preference.component.html",
})
export class ProfilEditPortailUsagerPreferenceComponent
  implements OnInit, OnDestroy
{
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  public loading: boolean;
  public submitted: boolean;
  public form: UntypedFormGroup = new UntypedFormGroup({});

  public editionInProgress: boolean;
  public loadings: string[] = [];

  public isLoginToDisplay: boolean;
  public loginToDisplay: {
    login: string;
    temporaryPassword: string;
  };

  private subscription = new Subscription();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastService: CustomToastService,
    private readonly usagerProfilService: UsagerProfilService,
    private readonly documentService: DocumentService
  ) {
    this.isLoginToDisplay = false;
    this.loginToDisplay = {
      login: "",
      temporaryPassword: "",
    };
    this.submitted = false;

    this.loading = false;
    this.loadings = [];

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

  private stopLoading(loadingRef: string): void {
    const index = this.loadings.indexOf(loadingRef);
    if (index !== -1) {
      this.loadings.splice(index, 1);
    }
  }

  public getDomifaCustomDoc(): void {
    const docType: StructureDocTypesAvailable = "acces_espace_domicilie";
    this.loadings.push(docType);
    this.subscription.add(
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
            saveAs(newBlob, docType + ".docx");

            this.stopLoading(docType);
          },
          error: () => {
            this.stopLoading(docType);
          },
        })
    );
  }

  public submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.toastService.error(
        "Un des champs du formulaire n'est pas rempli ou contient une erreur"
      );
      return;
    }
    this.loading = true;
    this.subscription.add(
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
        .subscribe({
          next: ({ login, temporaryPassword }) => {
            if (login && temporaryPassword) {
              this.isLoginToDisplay = true;
              this.loginToDisplay = {
                login,
                temporaryPassword,
              };
            } else {
              this.isLoginToDisplay = false;
              this.loginToDisplay = {
                login: "",
                temporaryPassword: "",
              };
            }
            this.submitted = false;
            this.loading = false;
            this.editionInProgress = false;
            this.toastService.success("Enregistrement des préférences réussi");
          },
          error: () => {
            this.loading = false;
            this.editionInProgress = false;
            this.toastService.error(
              "Veuillez vérifier les champs du formulaire"
            );
          },
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
