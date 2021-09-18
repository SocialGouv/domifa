import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { UsersService } from "src/app/modules/users/services/users.service";
import { fadeInOut } from "src/app/shared/animations";
import { minDateToday } from "src/app/shared/bootstrap-util";
import { UsagerLight, UserStructure } from "../../../../../../../_common/model";
import { DocumentService } from "../../../../../usager-shared/services/document.service";
import { UsagerFormModel } from "../../UsagerFormModel";

@Component({
  animations: [fadeInOut],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-rdv",
  styleUrls: ["./rdv.component.css"],
  templateUrl: "./rdv.component.html",
})
export class RdvComponent implements OnInit {
  public rdvForm!: FormGroup;

  public usager!: UsagerFormModel;
  public editRdv: boolean;

  public me: UserStructure;
  public agents: UserStructure[] = [];

  /* Config datepickers */
  public dToday = new Date();

  public minDateToday: NgbDateStruct;
  public maxDateRdv: NgbDateStruct;

  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    private documentService: DocumentService,
    private notifService: ToastrService,
    private authService: AuthService,
    private userService: UsersService,
    private nbgDate: NgbDateCustomParserFormatter,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute
  ) {
    this.editRdv = true;

    this.maxDateRdv = {
      day: this.dToday.getDate(),
      month: this.dToday.getMonth() + 1,
      year: this.dToday.getFullYear() + 2,
    };

    this.minDateToday = minDateToday;
  }

  get r(): any {
    return this.rdvForm.controls;
  }

  public ngOnInit() {
    this.titleService.setTitle("Rendez-vous de l'usager");

    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerService.findOne(id).subscribe({
        next: (usager: UsagerLight) => {
          this.usager = new UsagerFormModel(usager);

          this.initForm();
        },
        error: () => {
          this.router.navigate(["404"]);
        },
      });
    } else {
      this.router.navigate(["404"]);
    }
  }

  public getAttestation() {
    return this.documentService.attestation(this.usager.ref);
  }

  public initForm() {
    this.rdvForm = this.formBuilder.group({
      heureRdv: [this.usager.rdv.heureRdv, [Validators.required]],
      isNow: [this.usager.rdv.isNow, []],
      jourRdv: [this.usager.rdv.jourRdv, [Validators.required]],
      userId: [this.usager.rdv.userId, Validators.required],
    });

    this.editRdv = this.usager.rdv.dateRdv === null;

    this.userService.getUsersMeeting().subscribe((users: UserStructure[]) => {
      this.agents = users;

      const userIdRdv =
        this.usager.rdv.userId === null ? this.me.id : this.usager.rdv.userId;

      this.rdvForm.controls.userId.setValue(userIdRdv, {
        onlySelf: true,
      });
    });
  }

  public setValueRdv(value: boolean): void {
    if (value === true) {
      this.rdvForm.controls.isNow.setValue(true);
      this.rdvForm.controls.userId.setValue(this.me.id);
    } else {
      this.rdvForm.controls.isNow.setValue(false);
    }
  }

  public rdvNow(): void {
    const rdvFormValue = {
      isNow: true,
      dateRdv: new Date(),
      userId: this.me.id,
    };

    this.usagerService.setRdv(rdvFormValue, this.usager.ref).subscribe(
      (usager: UsagerLight) => {
        this.router.navigate(["usager/" + usager.ref + "/edit/entretien"]);
      },
      () => {
        this.notifService.error(
          "Impossible de réaliser l'entretien maintenant"
        );
      }
    );
  }

  public submitRdv(): void {
    if (this.rdvForm.invalid) {
      this.notifService.error("Veuillez vérifier les champs du formulaire");
      return;
    }

    if (this.rdvForm.get("isNow").value === true) {
      this.rdvNow();
      return;
    }

    const heureRdv = this.rdvForm.controls.heureRdv.value;
    const jourRdv = this.nbgDate.formatEn(this.rdvForm.controls.jourRdv.value);
    const dateRdv = new Date(jourRdv);
    dateRdv.setHours(heureRdv.hour, heureRdv.minute, 0);

    //

    const rdvFormValue = {
      isNow: false,
      dateRdv,
      userId: this.rdvForm.controls.userId.value,
    };

    this.usagerService.setRdv(rdvFormValue, this.usager.ref).subscribe({
      next: (usager: UsagerLight) => {
        this.notifService.success("Rendez-vous enregistré");
        this.usager = new UsagerFormModel(usager);
        this.editRdv = false;
      },
      error: () => {
        this.notifService.error("Impossible d'enregistrer le rendez-vous");
      },
    });
  }
}
