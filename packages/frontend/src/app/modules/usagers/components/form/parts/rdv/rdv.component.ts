import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import {
  NgbModal,
  NgbDateStruct,
  NgbDatepickerI18n,
  NgbDateParserFormatter,
} from "@ng-bootstrap/ng-bootstrap";
import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { ToastrService } from "ngx-toastr";

import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsersService } from "src/app/modules/users/services/users.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import {
  formatDateToNgb,
  minDateToday,
  minDateNaissance,
} from "src/app/shared/bootstrap-util";
import { Router, ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { fadeInOut } from "src/app/shared/animations";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import { AppUser } from "../../../../../../../_common/model";

@Component({
  animations: [fadeInOut],
  providers: [
    UsagerService,
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-rdv",
  styleUrls: ["./rdv.component.css"],
  templateUrl: "./rdv.component.html",
})
export class RdvComponent implements OnInit {
  public labels: any;
  public modal: any;

  public rdvForm!: FormGroup;

  public usager!: Usager;
  public etape: number;

  public editRdv!: boolean;

  @Output()
  public nextStep = new EventEmitter<number>();

  public me: AppUser;
  public agents: AppUser[] = [];

  /* Config datepickers */
  public dToday = new Date();
  public maxDateNaissance: NgbDateStruct;
  public minDateNaissance: NgbDateStruct;
  public minDateToday: NgbDateStruct;

  public maxDateRdv: NgbDateStruct;
  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    private notifService: ToastrService,
    public authService: AuthService,
    private userService: UsersService,
    private nbgDate: NgbDateCustomParserFormatter,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute
  ) {
    this.maxDateRdv = {
      day: this.dToday.getDate(),
      month: this.dToday.getMonth() + 1,
      year: this.dToday.getFullYear() + 2,
    };

    this.minDateToday = minDateToday;
    this.minDateNaissance = minDateNaissance;
    this.maxDateNaissance = formatDateToNgb(new Date());

    this.authService.currentUser.subscribe((user: AppUser) => {
      this.me = user;
    });

    this.etape = 1;
  }

  get r(): any {
    return this.rdvForm.controls;
  }

  public ngOnInit() {
    this.titleService.setTitle("Rendez-vous de l'usager");

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerService.findOne(id).subscribe(
        (usager: Usager) => {
          this.usager = usager;
          this.editRdv = usager.etapeDemande < 2;
          this.initForm();
        },
        (error) => {
          this.router.navigate(["404"]);
        }
      );
    } else {
      this.router.navigate(["404"]);
    }
  }

  public getAttestation() {
    return this.usagerService.attestation(this.usager.id);
  }

  public initForm() {
    this.rdvForm = this.formBuilder.group({
      dateRdv: [this.usager.rdv.dateRdv, [Validators.required]],
      heureRdv: [this.usager.rdv.heureRdv, [Validators.required]],
      isNow: [this.usager.rdv.isNow, []],
      jourRdv: [this.usager.rdv.jourRdv, [Validators.required]],
      userId: [this.usager.rdv.userId, Validators.required],
    });

    this.userService.getUsersMeeting().subscribe((users: AppUser[]) => {
      this.agents = users;

      const userIdRdv =
        this.usager.rdv.userId === null ? this.me.id : this.usager.rdv.userId;

      this.rdvForm.controls.userId.setValue(userIdRdv, {
        onlySelf: true,
      });
    });
  }

  public setValueRdv(value: boolean) {
    this.rdvForm.controls.isNow.setValue(value);
  }

  public rdvNow() {
    this.rdvForm.controls.isNow.setValue(true);
    this.submitRdv();
  }

  public submitRdv() {
    if (this.rdvForm.controls.isNow.value === true) {
      this.rdvForm.controls.userId.setValue(
        this.authService.currentUserValue.id
      );
      this.rdvForm.controls.dateRdv.setValue(new Date().toISOString());
    } else {
      if (this.rdvForm.invalid) {
        this.notifService.error("Veuillez vérifier les champs du formulaire");
      } else {
        const heureRdv = this.rdvForm.controls.heureRdv.value;
        const jourRdv = this.nbgDate.formatEn(
          this.rdvForm.controls.jourRdv.value
        );
        const dateTmp = new Date(jourRdv);
        dateTmp.setHours(heureRdv.hour, heureRdv.minute, 0);
        this.rdvForm.controls.dateRdv.setValue(dateTmp.toISOString());
      }
    }

    this.usagerService.createRdv(this.rdvForm.value, this.usager.id).subscribe(
      (usager: Usager) => {
        this.router.navigate(["usager/" + this.usager.id + "/edit/entretien"]);
        this.notifService.success("Rendez-vous enregistré");
      },
      (error) => {
        this.notifService.error("Impossible d'enregistrer le rendez-vous");
      }
    );
  }
}
