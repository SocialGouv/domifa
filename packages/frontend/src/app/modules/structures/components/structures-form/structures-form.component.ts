import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbModal,
  NgbTypeaheadSelectItemEvent
} from "@ng-bootstrap/ng-bootstrap";
import { Observable, of, Subject } from "rxjs";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap
} from "rxjs/operators";
import { AutocompleteAdresseService } from "src/app/services/autocomplete-adresse";
import { fadeInOut } from "../../../../shared/animations";
import { DEPARTEMENTS } from "../../../../shared/departements";
import { RegisterUserComponent } from "../../../users/components/register-user/register-user.component";
import { StructureService } from "../../services/structure.service";
import { Structure } from "../../structure.interface";
@Component({
  animations: [fadeInOut],
  selector: "app-structures-form",
  styleUrls: ["./structures-form.component.css"],
  templateUrl: "./structures-form.component.html"
})
export class StructuresFormComponent implements OnInit {
  get f() {
    return this.structureForm.controls;
  }
  public title: string;
  public success: boolean = false;
  public structureForm: FormGroup;
  public structure: Structure;
  public departements: any;
  public model: any;
  public submitted: boolean = false;
  public searching: boolean = false;
  public searchFailed: boolean;

  public etapeInscription: number;
  public etapes = [
    "Enregistrement de la structure",
    "Création du compte personnel"
  ];

  public successMessage: string;
  public errorMessage: string;

  public structureInscription = {
    etapeInscription: 0,
    structureId: 0
  };

  private successSubject = new Subject<string>();
  private errorSubject = new Subject<string>();

  constructor(
    private formBuilder: FormBuilder,
    private structureService: StructureService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private router: Router,
    private Autocomplete: AutocompleteAdresseService
  ) {}

  public ngOnInit() {
    this.departements = DEPARTEMENTS;
    this.structure = new Structure({});

    this.etapeInscription = 0;

    this.structureInscription = {
      etapeInscription: 0,
      structureId: 0
    };

    this.successSubject.subscribe(message => {
      this.successMessage = message;
      this.errorMessage = null;
    });

    this.errorSubject.subscribe(message => {
      this.errorMessage = message;
      this.successMessage = null;
    });

    this.initForm();
  }

  public initForm() {
    this.structureForm = this.formBuilder.group({
      adresse: [this.structure.adresse, [Validators.required]],
      adresseCourrier: [this.structure.adresseCourrier, []],
      adresseDifferente: [this.structure.adresseCourrier, []],
      agrement: [this.structure.agrement, []],
      codePostal: [this.structure.codePostal, [Validators.required]],
      complementAdresse: [this.structure.complementAdresse, []],
      departement: [this.structure.departement, []],
      departementAuto: ["", []],
      email: [this.structure.email, [Validators.required, Validators.email]],
      id: [this.structure.id, [Validators.required]],
      nom: [this.structure.nom, [Validators.required]],
      phone: [this.structure.phone, [Validators.required]],
      responsable: this.formBuilder.group({
        fonction: [this.structure.responsable.fonction, [Validators.required]],
        nom: [this.structure.responsable.nom, [Validators.required]],
        prenom: [this.structure.responsable.prenom, [Validators.required]]
      }),
      structureType: [this.structure.structureType, [Validators.required]],
      ville: [this.structure.ville, [Validators.required]]
    });
  }

  public submitStrucutre() {
    this.submitted = true;

    if (this.structureForm.invalid) {
      Object.keys(this.structureForm.controls).forEach(key => {
        if (this.structureForm.get(key).errors !== null) {
          this.changeSuccessMessage(
            "veuillez vérifier les champs marqués en rouge dans le formulaire",
            true
          );
        }
      });
    } else {
      this.structureService.create(this.structureForm.value).subscribe(
        (structure: Structure) => {
          this.changeSuccessMessage("La structure a bien été enregistrée");
          this.structure = new Structure(structure);
          this.etapeInscription = 1;
          this.structureInscription.etapeInscription = 1;
          this.structureInscription.structureId = structure.id;
        },
        error => {
          this.changeSuccessMessage(
            "Veuillez vérifier les champs du formulaire",
            true
          );
        }
      );
    }
  }

  public searchDepartement = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map(term =>
        term === ""
          ? []
          : this.departements
              .filter(dep => {
                return (
                  dep.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                  dep.code.toLowerCase().indexOf(term.toLowerCase()) > -1
                );
              })
              .slice(0, 10)
      )
    );

  public selectDepartement(event: NgbTypeaheadSelectItemEvent): void {
    this.structureForm.controls.departement.setValue(event.item.code);
  }

  public formatDepartement(x: any) {
    if (x.name !== undefined) {
      return x.name + ", " + x.code;
    }
  }

  public changeSuccessMessage(message: string, error?: boolean) {
    window.scroll({
      behavior: "smooth",
      left: 0,
      top: 0
    });
    error ? this.errorSubject.next(message) : this.successSubject.next(message);
  }
}
