import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
} from "@angular/forms";

import { Subject, Subscription } from "rxjs";
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "@khazii/ngx-intl-tel-input";
import { getFormPhone } from "../../../../shared/phone";
import { CustomToastService } from "../../../shared/services";
import { StructureService } from "../../services";

import {
  isInvalidStructureName,
  updateSourceQuestion,
} from "../../utils/structure-validators";
import {
  StructureCommon,
  Structure,
  STRUCTURE_ORGANISME_TYPE_LABELS,
  DEPARTEMENTS_LISTE,
  NETWORKS,
  CURRENT_TOOL_OPTIONS,
  MARKET_TOOLS_OPTIONS,
  SOURCES_OPTIONS,
  RegistrationSources,
} from "@domifa/common";
import {
  COUNTRY_CODES_TIMEZONE,
  PREFERRED_COUNTRIES,
} from "../../../../../_common/model";
import { initEditionForm, setupFormSubscriptions } from "../../utils";

@Component({
  selector: "app-structure-edit-form",
  templateUrl: "./structure-edit-form.component.html",
  styleUrls: ["./structure-edit-form.component.css"],
})
export class StructureEditFormComponent implements OnInit, OnDestroy {
  public readonly PhoneNumberFormat = PhoneNumberFormat;
  public readonly SearchCountryField = SearchCountryField;
  public readonly CountryISO = CountryISO;
  public readonly PREFERRED_COUNTRIES: CountryISO[] = PREFERRED_COUNTRIES;
  public readonly STRUCTURE_ORGANISME_TYPE_LABELS =
    STRUCTURE_ORGANISME_TYPE_LABELS;
  public readonly DEPARTEMENTS_LISTE = DEPARTEMENTS_LISTE;

  public loading = false;
  public submitted = false;
  public structureForm: UntypedFormGroup;
  public selectedCountryISO: CountryISO = CountryISO.France;

  @Input() public structure!: StructureCommon;

  private readonly subscription = new Subscription();
  private readonly unsubscribe: Subject<void> = new Subject();

  public readonly NETWORKS = NETWORKS;
  public showsourceDetail = false;
  public readonly CURRENT_TOOL_OPTIONS = CURRENT_TOOL_OPTIONS;
  public readonly SOURCES_OPTIONS = SOURCES_OPTIONS;
  public readonly MARKET_TOOLS_OPTIONS = MARKET_TOOLS_OPTIONS;
  constructor(
    private readonly structureService: StructureService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastService: CustomToastService
  ) {
    this.structureForm = new UntypedFormGroup({});
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.structureForm.controls;
  }

  public get fonctionControl(): AbstractControl {
    return this.structureForm.get("responsable").get("fonction");
  }

  public get fonctionDetailControl(): AbstractControl {
    return this.structureForm.get("responsable")?.get("fonctionDetail");
  }

  public get reg(): { [key: string]: AbstractControl } {
    return (this.structureForm.get("registrationData") as FormGroup).controls;
  }

  public ngOnInit(): void {
    this.structureForm = initEditionForm(this.structure, this.formBuilder);

    this.selectedCountryISO = COUNTRY_CODES_TIMEZONE[
      this.structure.timeZone
    ] as CountryISO;

    this.showsourceDetail = updateSourceQuestion(
      this.structureForm,
      this.structure.registrationData?.source
    );

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

  public submitStrucutre() {
    this.submitted = true;

    if (this.structureForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
      return;
    }

    this.loading = true;

    const structureFormValue: Structure = {
      ...this.structureForm.value,
    };

    structureFormValue.telephone = getFormPhone(
      this.structureForm.value.telephone
    );

    this.subscription.add(
      this.structureService.patch(structureFormValue).subscribe({
        next: (structure: StructureCommon) => {
          this.toastService.success(
            "Les modifications ont bien été prises en compte"
          );

          this.structure = structure;
          this.loading = false;
        },
        error: () => {
          this.toastService.error("Une erreur est survenue");
          this.loading = false;
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
