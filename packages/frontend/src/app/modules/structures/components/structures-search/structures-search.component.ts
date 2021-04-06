import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { StructureCommon } from "../../../../../_common/model";
import { StructureService } from "../../services/structure.service";

@Component({
  selector: "app-structures-search",
  styleUrls: ["./structures-search.component.css"],
  templateUrl: "./structures-search.component.html",
})
export class StructuresSearchComponent implements OnInit {
  public structures: StructureCommon[];
  public searchFailed: boolean;

  public codePostal: string;
  public codePostalForm!: FormGroup;

  constructor(
    private structureService: StructureService,
    private formBuilder: FormBuilder,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    this.searchFailed = false;
    this.structures = [];
    this.codePostal = "";
  }

  get f() {
    return this.codePostalForm.controls;
  }

  public ngOnInit() {
    this.titleService.setTitle("Inscrivez-vous sur Domifa");
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

  public submitCodePostal() {
    if (this.codePostalForm.invalid) {
      this.notifService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
    } else {
      this.structureService
        .find(this.f.codePostal.value)
        .subscribe((structures: StructureCommon[]) => {
          if (structures.length === 0) {
            this.searchFailed = true;
          } else {
            this.searchFailed = false;
            this.structures = structures;
          }
        });
    }
  }
}
