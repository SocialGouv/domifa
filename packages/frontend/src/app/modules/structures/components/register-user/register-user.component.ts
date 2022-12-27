import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";

import { of, Subject, Subscription } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import {
  UserStructure,
  StructureCommon,
  FormEmailTakenValidator,
} from "../../../../../_common/model";
import { fadeInOut, noWhiteSpace, regexp } from "../../../../shared";

import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { PASSWORD_VALIDATOR } from "../../../users/PASSWORD_VALIDATOR.const";
import { userStructureBuilder } from "../../../users/services";
import { PasswordValidator } from "../../../users/services/password-validator.service";
import { UsersService } from "../../../users/services/users.service";
import { StructureService } from "../../services/structure.service";

@Component({
  animations: [fadeInOut],
  selector: "app-register-user",
  styleUrls: ["./register-user.component.css"],
  templateUrl: "./register-user.component.html",
})
export class RegisterUserComponent implements OnInit, OnDestroy {
  public user: UserStructure;
  public userForm!: UntypedFormGroup;

  public submitted: boolean;
  public loading: boolean;
  public success: boolean;

  public emailExist = false;

  private unsubscribe: Subject<void> = new Subject();
  private subscription = new Subscription();

  @Input() public structureRegisterInfos!: {
    etapeInscription: number;
    structure: StructureCommon;
  };

  public get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly userService: UsersService,
    private readonly structureService: StructureService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title
  ) {
    this.user = userStructureBuilder.buildUserStructure({});
    this.submitted = false;
    this.loading = false;
    this.success = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Inscription sur DomiFa : étape 2");

    this.userForm = this.formBuilder.group(
      {
        passwordConfirmation: new UntypedFormControl(
          null,
          Validators.compose(PASSWORD_VALIDATOR)
        ),
        email: [
          this.user.email,
          [Validators.pattern(regexp.email), Validators.required],
          this.validateEmailNotTaken.bind(this),
        ],
        fonction: [this.user.fonction, Validators.required],
        nom: [
          this.user.nom,
          [Validators.required, Validators.minLength(2), noWhiteSpace],
        ],
        password: new UntypedFormControl(
          null,
          Validators.compose(PASSWORD_VALIDATOR)
        ),
        prenom: [
          this.user.prenom,
          [Validators.required, Validators.minLength(2), noWhiteSpace],
        ],
      },
      {
        validators: [PasswordValidator.passwordMatchValidator],
      }
    );
  }

  public submitUser() {
    this.submitted = true;

    if (this.userForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
    } else {
      this.loading = true;

      this.subscription.add(
        this.structureService
          .create({
            structure: this.structureRegisterInfos.structure,
            user: this.userForm.value,
          })
          .subscribe({
            next: () => {
              this.success = true;
              this.loading = false;
              this.toastService.success(
                "Félicitations, votre compte a été créé avec succès"
              );
            },
            error: () => {
              this.loading = false;
              this.toastService.error(
                "Veuillez vérifier les champs du formulaire"
              );
            },
          })
      );
    }
  }

  public validateEmailNotTaken(
    control: AbstractControl
  ): FormEmailTakenValidator {
    const testEmail = RegExp(regexp.email).test(control.value);
    return testEmail
      ? this.userService.validateEmail(control.value).pipe(
          takeUntil(this.unsubscribe),
          map((res: boolean) => {
            return res === false ? null : { emailTaken: true };
          })
        )
      : of(null);
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
