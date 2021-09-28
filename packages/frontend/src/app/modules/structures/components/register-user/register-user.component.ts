import { Component, Input, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { StructureService } from "src/app/modules/structures/services/structure.service";
import { StructureCommon, UserStructure } from "../../../../../_common/model";
import { fadeInOut } from "../../../../shared/animations";
import { regexp } from "../../../../shared/validators";
import { userStructureBuilder } from "../../../users/services";
import { PasswordValidator } from "../../../users/services/password-validator.service";
import { UsersService } from "../../../users/services/users.service";

@Component({
  animations: [fadeInOut],
  selector: "app-register-user",
  styleUrls: ["./register-user.component.css"],
  templateUrl: "./register-user.component.html",
})
export class RegisterUserComponent implements OnInit {
  public user: UserStructure;
  public userForm: FormGroup;

  public submitted: boolean;
  public success: boolean;

  public hidePassword: boolean;
  public hidePasswordConfirm: boolean;

  public emailExist: boolean = false;

  @Input() public structureRegisterInfos!: {
    etapeInscription: number;
    structure: StructureCommon;
  };

  get f() {
    return this.userForm.controls;
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: UsersService,
    private structureService: StructureService,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    this.user = userStructureBuilder.buildUserStructure({});
    this.hidePassword = true;
    this.hidePasswordConfirm = true;
    this.submitted = false;
    this.success = false;
  }

  public ngOnInit() {
    this.titleService.setTitle("Inscription sur Domifa : étape 2");

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
      },
      {
        validator: PasswordValidator.passwordMatchValidator,
      }
    );
  }

  public togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  public submitUser() {
    this.submitted = true;
    if (this.userForm.invalid) {
      this.notifService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire",
        "Erreur dans le formulaire"
      );
    } else {
      this.structureService
        .create({
          structure: this.structureRegisterInfos.structure,
          user: this.userForm.value,
        })
        .subscribe(
          (structure: StructureCommon) => {
            this.success = true;
            this.notifService.success(
              "Votre compte a été créé avec succès",
              "Félicitations !"
            );
          },
          () => {
            this.notifService.error(
              "Veuillez vérifier les champs du formulaire"
            );
          }
        );
    }
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
