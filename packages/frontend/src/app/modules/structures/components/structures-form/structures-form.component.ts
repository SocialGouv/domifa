import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "@khazii/ngx-intl-tel-input";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { Subject, Subscription } from "rxjs";

import { PREFERRED_COUNTRIES } from "../../../../../_common/model";
import { StructureService } from "../../services/structure.service";
import { StructureCommonWeb } from "../../classes/StructureCommonWeb.class";
import { MatomoTracker } from "ngx-matomo-client";

import { getFormPhone } from "../../../../shared/phone";
import {
  StructureCommon,
  Structure,
  STRUCTURE_ORGANISME_TYPE_LABELS,
  getDepartementFromCodePostal,
  DEPARTEMENTS_LISTE,
  NETWORKS,
  CURRENT_TOOL_OPTIONS,
  MARKET_TOOLS_OPTIONS,
  SOURCES_OPTIONS,
  RegistrationSources,
  USER_FONCTION_LABELS,
} from "@domifa/common";

import {
  isInvalidStructureName,
  updateSourceQuestion,
} from "../../utils/structure-validators";
import { initCreationForm, setupFormSubscriptions } from "../../utils";

@Component({
  selector: "app-structures-form",
  styleUrls: ["./structures-form.component.css"],
  templateUrl: "./structures-form.component.html",
})
export class StructuresFormComponent implements OnInit, OnDestroy {
  public readonly PhoneNumberFormat = PhoneNumberFormat;
  public readonly SearchCountryField = SearchCountryField;
  public readonly CountryISO = CountryISO;
  public readonly PREFERRED_COUNTRIES: CountryISO[] = PREFERRED_COUNTRIES;
  public readonly CURRENT_TOOL_OPTIONS = CURRENT_TOOL_OPTIONS;
  public readonly SOURCES_OPTIONS = SOURCES_OPTIONS;
  public readonly MARKET_TOOLS_OPTIONS = MARKET_TOOLS_OPTIONS;
  public readonly USER_FONCTION_LABELS = USER_FONCTION_LABELS;
  public success = false;

  public loading = false;
  public structureForm!: UntypedFormGroup;
  public structure: StructureCommon;
  public readonly DEPARTEMENTS_LISTE = DEPARTEMENTS_LISTE;
  public readonly STRUCTURE_ORGANISME_TYPE_LABELS =
    STRUCTURE_ORGANISME_TYPE_LABELS;
  public submitted = false;

  public structureRegisterInfos: {
    etapeInscription: number;
    structure: StructureCommon;
  };
  public accountExist: boolean;

  private readonly unsubscribe: Subject<void> = new Subject();
  private readonly subscription = new Subscription();
  public readonly NETWORKS = NETWORKS;

  public showsourceDetail = false;
  public compareOriginalOrder = () => 0;
  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly structureService: StructureService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title,
    private readonly matomo: MatomoTracker
  ) {
    this.structure = new StructureCommonWeb();

    this.structureRegisterInfos = {
      etapeInscription: 0,
      structure: this.structure,
    };

    this.accountExist = false;
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.structureForm.controls;
  }

  // TODO: fix controls with 2 nested form groups
  public get fonctionControl(): AbstractControl {
    return this.structureForm.controls["responsable"].get("fonction");
  }

  public get reg(): { [key: string]: AbstractControl } {
    return (this.structureForm.get("registrationData") as FormGroup).controls;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Inscription d'une structure sur DomiFa");

    this.structureForm = initCreationForm(this.structure, this.formBuilder);

    setupFormSubscriptions(this.structureForm, this.subscription);

    this.subscription.add(
      this.structureForm
        .get("registrationData")
        ?.get("source")
        ?.valueChanges.subscribe((value: RegistrationSources) => {
          this.showsourceDetail = updateSourceQuestion(
            this.structureForm,
            value
          );
        })
    );
  }

  public submitStrucutre(): void {
    this.submitted = true;

    if (this.structureForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
      return;
    }

    const departement = getDepartementFromCodePostal(
      this.structureForm.value.codePostal
    );

    const structureFormValue: Partial<Structure> = {
      ...this.structureForm.value,
      options: {
        numeroBoite: true,
        surnom: false,
        nomStructure: true,
      },
      departement,
      telephone: getFormPhone(this.structureForm.value.telephone),
    };

    this.subscription.add(
      this.structureService.prePost(structureFormValue).subscribe({
        next: (structure: StructureCommon) => {
          this.structureRegisterInfos.etapeInscription = 1;
          this.structureRegisterInfos.structure = structure;
          this.matomo.trackEvent(
            "INSCRIPTION_STRUCTURE",
            "VALIDATION_ETAPE_1",
            "SUCCESS",
            1
          );
          window.scroll({
            behavior: "smooth",
            left: 0,
            top: 0,
          });
        },
        error: () => {
          this.toastService.error("Veuillez vérifier les champs du formulaire");
        },
      })
    );
  }

  public isInvalidStructureName(structureName: string): boolean {
    return isInvalidStructureName(structureName);
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.subscription.unsubscribe();
  }
}
