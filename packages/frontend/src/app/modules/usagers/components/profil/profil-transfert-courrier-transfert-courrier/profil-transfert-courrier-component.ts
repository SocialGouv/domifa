import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { User } from "src/app/modules/users/interfaces/user";
import { UserRole } from "src/app/modules/users/interfaces/user-role.type";
import { minDateToday } from "src/app/shared/bootstrap-util";
import { endDateAfterBeginDate } from "src/app/shared/validators";
import { LoadingService } from "../../../../loading/loading.service";
import { Options } from "../../../interfaces/options";
import { Usager } from "../../../interfaces/usager";
import { UsagerService } from "../../../services/usager.service";

@Component({
  selector: "app-profil-transfert-courrier",
  styleUrls: ["./profil-transfert-courrier.css"],
  templateUrl: "./profil-transfert-courrier.html",
})
export class UsagersProfilTransfertCourrierComponent implements OnInit {
  @Input() public usager: Usager;
  @Input() public me: User;

  public actions = {
    EDIT: "Modification",
    DELETE: "Suppression",
    CREATION: "Création",
  };

  public editTransfertForm: boolean;
  public transfertForm!: FormGroup;
  public minDateToday: NgbDateStruct;

  constructor(
    private formBuilder: FormBuilder,
    public loadingService: LoadingService,
    public authService: AuthService,
    private nbgDate: NgbDateCustomParserFormatter,
    private notifService: ToastrService,
    private usagerService: UsagerService
  ) {
    this.editTransfertForm = false;
    this.minDateToday = minDateToday;
  }

  public isRole(role: UserRole) {
    return this.me.role === role;
  }

  public ngOnInit() {
    this.initForm();
  }

  get t() {
    return this.transfertForm.controls;
  }

  public initForm() {
    this.transfertForm = this.formBuilder.group({
      nom: [this.usager.options.transfert.nom, [Validators.required]],
      adresse: [
        this.usager.options.transfert.adresse,
        [Validators.required, Validators.minLength(10)],
      ],

      dateFin: [
        this.usager.options.transfert.dateFin,
        [
          Validators.required,
          endDateAfterBeginDate({
            beginDateControlName: "dateDebut",
            endDateControlName: "dateFin",
          }),
        ],
      ],
      dateDebut: [
        this.usager.options.transfert.dateDebut,
        [Validators.required],
      ],

      dateFinPicker: [
        this.usager.options.transfert.dateFinPicker,
        [Validators.required],
      ],
      dateDebutPicker: [
        this.usager.options.transfert.dateDebutPicker,
        [Validators.required],
      ],
    });
  }

  public editTransfert() {
    const dateFin = this.nbgDate.formatEn(
      this.transfertForm.controls.dateFinPicker.value
    );
    const dateDebut = this.nbgDate.formatEn(
      this.transfertForm.controls.dateDebutPicker.value
    );

    if (dateFin === null || dateDebut === null) {
      this.notifService.error("La date de fin du transfert est incorrecte.");
      return;
    }

    this.transfertForm.controls.dateFin.setValue(
      new Date(dateFin).toISOString()
    );

    this.transfertForm.controls.dateDebut.setValue(
      new Date(dateDebut).toISOString()
    );

    this.usagerService
      .editTransfert(this.transfertForm.value, this.usager.id)
      .subscribe(
        (usager: any) => {
          this.editTransfertForm = false;
          this.usager.options = new Options(usager.options);
          this.notifService.success("Transfert ajouté avec succès");
        },
        (error) => {
          this.notifService.error("Impossible d'ajouter le transfert'");
        }
      );
  }

  public deleteTransfert() {
    this.usagerService.deleteTransfert(this.usager.id).subscribe(
      (usager: any) => {
        this.editTransfertForm = false;
        this.transfertForm.reset();
        this.usager.options = new Options(usager.options);
        this.notifService.success("Transfert supprimé avec succès");
      },
      (error) => {
        this.notifService.error("Impossible de supprimer la fiche");
      }
    );
  }
}
