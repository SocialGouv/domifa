import { Component, Input, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { StructureService } from "src/app/modules/structures/services/structure.service";
import { Structure } from "src/app/modules/structures/structure.interface";
import { AppUser } from "../../../../../_common/model";
import { fadeInOut } from "../../../../shared/animations";
import { regexp } from "../../../../shared/validators";
import { appUserBuilder } from "../../services";
import { PasswordValidator } from "../../services/password-validator.service";
import { UsersService } from "../../services/users.service";
import { MatomoTracker } from "ngx-matomo";

@Component({
  animations: [fadeInOut],
  selector: "app-register-user",
  styleUrls: ["./register-user.component.css"],
  templateUrl: "./register-user.component.html",
})
export class RegisterUserComponent implements OnInit {
  public user: AppUser;
  public userForm: FormGroup;

  public submitted: boolean;
  public success: boolean;

  public hidePassword: boolean;
  public hidePasswordConfirm: boolean;

  public emailExist: boolean = false;

  @Input() public structureChild!: {
    etapeInscription: number;
    structureId: number;
    structure: Structure;
  };

  get f() {
    return this.userForm.controls;
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: UsersService,
    private route: ActivatedRoute,
    private structureService: StructureService,
    private notifService: ToastrService,
    private titleService: Title,
    private matomo: MatomoTracker
  ) {
    this.hidePassword = true;
    this.hidePasswordConfirm = true;
    this.user = appUserBuilder.buildAppUser({});
    this.submitted = false;
    this.success = false;
  }

  public ngOnInit() {
    this.titleService.setTitle("Inscription sur Domifa");
    this.user.structureId =
      this.structureChild !== undefined
        ? this.structureChild.structureId
        : (this.user.structureId = parseInt(this.route.snapshot.params.id, 10));

    this.userForm = this.formBuilder.group(
      {
        confirmPassword: [null, Validators.compose([Validators.required])],
        email: [
          this.user.email,
          [Validators.pattern(regexp.email), Validators.required],
          this.validateEmailNotTaken.bind(this),
        ],
        fonction: [this.user.fonction, Validators.required],
        nom: [this.user.nom, Validators.required],
        password: [
          null,
          Validators.compose([
            Validators.required,
            PasswordValidator.patternValidator(/\d/, {
              hasNumber: true,
            }),
            PasswordValidator.patternValidator(/[A-Z]/, {
              hasCapitalCase: true,
            }),
            Validators.minLength(12),
          ]),
        ],
        prenom: [this.user.prenom, Validators.required],
        structureId: [this.user.structureId, []],
      },
      {
        validator: PasswordValidator.passwordMatchValidator,
      }
    );
  }

  public submitUser() {
    this.submitted = true;
    if (this.userForm.invalid) {
      this.notifService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire",
        "Erreur dans le formulaire"
      );
    } else {
      if (this.structureChild) {
        this.structureService.create(this.structureChild.structure).subscribe(
          (structure: Structure) => {
            this.userForm.controls.structureId.setValue(structure.id);
            this.structureChild.structureId = structure.id;
            this.user.structureId = structure.id;
            this.postUser();
          },
          (error) => {
            this.notifService.error(
              "Veuillez vérifier les champs du formulaire"
            );
          }
        );
      } else {
        this.postUser();
      }
    }
  }

  public postUser() {
    this.userService.create(this.userForm.value).subscribe(
      (user: AppUser) => {
        this.success = true;
        this.notifService.success(
          "Votre compte a été créé avec succès",
          "Félicitations !"
        );
        this.matomo.trackEvent(
          "tests_utilisateurs",
          "inscription_user",
          "structure_form",
          1
        );
      },
      () => {
        this.notifService.error(
          "veuillez vérifier les champs marqués en rouge dans le formulaire",
          "Erreur dans le formulaire"
        );
      }
    );
  }

  public validateEmailNotTaken(control: AbstractControl) {
    const testEmail = RegExp(regexp.email).test(control.value);
    return testEmail
      ? this.userService.validateEmail(control.value).pipe(
          map((res: boolean) => {
            return res === false ? null : { emailTaken: true };
          })
        )
      : of(null);
  }
}
