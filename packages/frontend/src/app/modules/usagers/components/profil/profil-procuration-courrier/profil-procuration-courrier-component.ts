import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { User } from "src/app/modules/users/interfaces/user";
import { UserRole } from "src/app/modules/users/interfaces/user-role.type";
import {
  minDateNaissance,
  formatDateToNgb,
  minDateToday,
} from "src/app/shared/bootstrap-util";
import { endDateAfterBeginDateValidator } from "src/app/shared/validators";
import { LoadingService } from "../../../../loading/loading.service";
import { Options } from "../../../interfaces/options";
import { Usager } from "../../../interfaces/usager";
import { UsagerService } from "../../../services/usager.service";

@Component({
  selector: "app-profil-procuration-courrier",
  styleUrls: ["./profil-procuration-courrier.css"],
  templateUrl: "./profil-procuration-courrier.html",
})
export class UsagersProfilProcurationCourrierComponent implements OnInit {
  @Input() public usager: Usager;
  @Input() public me: User;

  public actions = {
    EDIT: "Modification",
    DELETE: "Suppression",
    CREATION: "Création",
  };

  public isFormVisible: boolean;
  public procurationForm!: FormGroup;
  public minDateToday: NgbDateStruct;

  public minDateNaissance: NgbDateStruct;
  public maxDateNaissance: NgbDateStruct;

  constructor(
    private formBuilder: FormBuilder,
    public loadingService: LoadingService,
    public authService: AuthService,
    private nbgDate: NgbDateCustomParserFormatter,
    private notifService: ToastrService,
    private usagerService: UsagerService
  ) {
    this.hideForm();
    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());
  }

  public isRole(role: UserRole) {
    return this.me.role === role;
  }

  public ngOnInit() {
    this.initForm();
  }

  public showForm() {
    this.isFormVisible = true;
    this.initForm();
  }
  public hideForm() {
    this.isFormVisible = false;
  }

  get f() {
    return this.procurationForm.controls;
  }

  public initForm() {
    this.procurationForm = this.formBuilder.group(
      {
        nom: [this.usager.options.procuration.nom, [Validators.required]],
        prenom: [this.usager.options.procuration.prenom, [Validators.required]],
        dateFin: [
          formatDateToNgb(this.usager.options.procuration.dateFin),
          [Validators.required],
        ],
        dateDebut: [
          formatDateToNgb(this.usager.options.procuration.dateDebut),
          [Validators.required],
        ],
        dateNaissance: [
          formatDateToNgb(this.usager.options.procuration.dateNaissance),
          [Validators.required],
        ],
      },
      {
        validator: endDateAfterBeginDateValidator({
          beginDateControlName: "dateDebut",
          endDateControlName: "dateFin",
        }),
      }
    );
  }

  public editProcuration() {
    const formValue = {
      ...this.procurationForm.value,
      dateFin: this.nbgDate.formatEn(
        this.procurationForm.controls.dateFin.value
      ),
      dateDebut: this.nbgDate.formatEn(
        this.procurationForm.controls.dateDebut.value
      ),
      dateNaissance: this.nbgDate.formatEn(
        this.procurationForm.controls.dateNaissance.value
      ),
    };

    this.usagerService.editProcuration(formValue, this.usager.id).subscribe(
      (usager: any) => {
        this.hideForm();
        this.usager.options = new Options(usager.options);
        this.notifService.success("Procuration ajoutée avec succès");
      },
      (error) => {
        this.notifService.error("Impossible d'ajouter la procuration'");
      }
    );
  }

  public deleteProcuration() {
    this.usagerService.deleteProcuration(this.usager.id).subscribe(
      (usager: any) => {
        this.hideForm();
        this.procurationForm.reset();
        this.usager.options = new Options(usager.options);
        this.notifService.success("Procuration supprimée avec succès");
      },
      (error) => {
        this.notifService.error("Impossible de supprimer la fiche");
      }
    );
  }
}
