import { animate, style, transition, trigger } from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs";
import { debounceTime, map } from "rxjs/operators";
import { isNumber } from "src/app/services/bootstrap-util";
import { DEPARTEMENTS } from "../../../../shared/departements";
import { StructureService } from "../../services/structure.service";
import { Structure } from "../../structure.interface";

@Component({
  selector: "app-structures-form",
  styleUrls: ["./structures-form.component.css"],
  templateUrl: "./structures-form.component.html"
})
export class StructuresFormComponent implements OnInit {
  get f() {
    return this.structureForm.controls;
  }
  public title: string;
  public structureForm: FormGroup;
  public structure: Structure;
  public departements: any;
  public model: any;
  public submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private structureService: StructureService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private router: Router
  ) {}

  public formatter = (x: { name: string }) => x.name;

  public ngOnInit() {
    this.departements = DEPARTEMENTS;
    this.structure = new Structure({});
    this.initForm();
  }

  public initForm() {
    this.structureForm = this.formBuilder.group({
      adresseAuto: [this.structure.adresse, []],
      adressePostale: [this.structure.adresse, []],
      agrement: [this.structure.agrement, []],
      codePostal: [this.structure.codePostal, [Validators.required]],
      complementAdresse: [this.structure.complementAdresse, []],
      departement: [this.structure.departement, []],
      departementSearch: [this.structure.departement, []],
      email: [this.structure.email, [Validators.required, Validators.email]],
      nom: [this.structure.nom, [Validators.required]],
      phone: [this.structure.phone, []],
      responsable: this.formBuilder.group({
        fonction: [this.structure.responsable.fonction, [Validators.required]],
        nom: [this.structure.responsable.nom, [Validators.required]],
        prenom: [this.structure.responsable.prenom, [Validators.required]]
      }),
      structureType: [this.structure.structureType, [Validators.required]],
      ville: [this.structure.ville, [Validators.required]]
    });
  }

  public search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term =>
        term === ""
          ? []
          : this.departements
              .filter(
                dep => dep.name.toLowerCase().indexOf(term.toLowerCase()) > -1
              )
              .slice(0, 10)
      )
    );
}
