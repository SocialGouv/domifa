import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { saveAs } from "file-saver";
import { Subscription } from "rxjs";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../../_common/model";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { DocumentService } from "../../../../usager-shared/services/document.service";
import { StructureDocTypesAvailable, UserStructure } from "@domifa/common";
import {
  PortailUsagersInformations,
  PortailUsagersService,
} from "../../../services/portail-usagers.service";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";

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

  public isLoginToDisplay: boolean;
  public loginToDisplay: {
    login: string;
    temporaryPassword: string;
  };

  @ViewChild("confirmationModal", { static: true })
  public confirmationModal!: TemplateRef<NgbModalRef>;

  private readonly subscription = new Subscription();
  public portailUsagersInformations: PortailUsagersInformations | null;

  constructor(
    private readonly toastService: CustomToastService,
    private readonly documentService: DocumentService,
    private readonly portailUsagersService: PortailUsagersService,
    private readonly modalService: NgbModal
  ) {
    this.isLoginToDisplay = false;
    this.loginToDisplay = {
      login: "",
      temporaryPassword: "",
    };

    this.loading = false;

    this.portailUsagersInformations = null;
  }

  public ngOnInit(): void {
    this.getPortaiUsagersInformations();
  }

  public openConfirmationModal(): void {
    this.modalService.open(this.confirmationModal, DEFAULT_MODAL_OPTIONS);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public getPortaiUsagersInformations(): void {
    this.subscription.add(
      this.portailUsagersService
        .getPortailUsagersInformations(this.usager.ref)
        .subscribe({
          next: (
            portailUsagersInformations: PortailUsagersInformations | null
          ) => {
            this.portailUsagersInformations = portailUsagersInformations;
          },
          error: () => {
            this.toastService.error("Le dossier recherché n'existe pas");
          },
        })
    );
  }

  public getDomifaCustomDoc(): void {
    const docType: StructureDocTypesAvailable =
      StructureDocTypesAvailable.acces_espace_domicilie;
    this.loading = true;
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
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          },
        })
    );
  }

  public resetPassword(): void {
    this.loading = true;
    this.subscription.add(
      this.portailUsagersService
        .updatePortailUsagerOptions({
          usagerRef: this.usager.ref,
          options: {
            portailUsagerEnabled: true,
            generateNewPassword: true,
          },
        })
        .subscribe({
          next: ({ login, temporaryPassword }) => {
            this.isLoginToDisplay = true;
            this.loginToDisplay = {
              login,
              temporaryPassword,
            };

            this.loading = false;
            this.toastService.success("Enregistrement des préférences réussi");
            this.getDomifaCustomDoc();
            this.getPortaiUsagersInformations();
            this.closeModals();
          },
          error: () => {
            this.loading = false;
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
