import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Subscription } from "rxjs";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { environment } from "../../../../../environments/environment";
import { StructureCommon } from "../../../../../_common/model";
import { StructureService } from "../../services/structure.service";

@Component({
  selector: "app-structures-search",
  styleUrls: ["./structures-search.component.css"],
  templateUrl: "./structures-search.component.html",
})
export class StructuresSearchComponent implements OnInit, OnDestroy {
  public structures: StructureCommon[];
  public searchFailed: boolean;

  public codePostal: string;
  public submitted: boolean;
  public loading: boolean;
  public codePostalForm!: UntypedFormGroup;

  private subscription = new Subscription();

  public portailUsagerUrl = environment.portailUsagersUrl;

  constructor(
    private readonly structureService: StructureService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title
  ) {
    this.searchFailed = false;
    this.submitted = false;
    this.loading = false;
    this.structures = [];
    this.codePostal = "";
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.codePostalForm.controls;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Inscrivez-vous sur DomiFa");
    this.codePostalForm = this.formBuilder.group({
      codePostal: [
        this.codePostal,
        [
          Validators.required,
          Validators.maxLength(5),
          this.structureService.codePostalValidator(),
        ],
      ],
    });
  }

  public submitCodePostal(): void {
    this.submitted = true;
    if (this.codePostalForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
      return;
    }
    this.loading = true;

    this.subscription.add(
      this.structureService.find(this.f.codePostal.value).subscribe({
        next: (structures: StructureCommon[]) => {
          this.loading = false;
          this.submitted = true;
          if (structures.length === 0) {
            this.searchFailed = true;
          } else {
            this.searchFailed = false;
            this.structures = structures;
          }
        },
        error: () => {
          this.loading = false;
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
