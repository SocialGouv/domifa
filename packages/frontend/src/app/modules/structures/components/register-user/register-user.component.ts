import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Subject, Subscription } from "rxjs";
import {
  EmailValidator,
  fadeInOut,
  NoWhiteSpaceValidator,
} from "../../../../shared";
import { CustomToastService } from "../../../shared/services";
import { PASSWORD_VALIDATOR } from "../../../users/PASSWORD_VALIDATOR.const";
import {
  userStructureBuilder,
  PasswordValidator,
} from "../../../users/services";
import { StructureService } from "../../services";
import { UserStructure, StructureCommon } from "@domifa/common";
import { MatomoTracker } from "ngx-matomo-client";

@Component({
  animations: [fadeInOut],
  selector: "app-register-user",
  templateUrl: "./register-user.component.html",
})
export class RegisterUserComponent implements OnInit, OnDestroy {
  public user: UserStructure;
  public userForm!: UntypedFormGroup;

  public submitted: boolean;
  public loading: boolean;
  public success: boolean;

  private readonly unsubscribe: Subject<void> = new Subject();
  private readonly subscription = new Subscription();

  @Input() public structureRegisterInfos!: {
    etapeInscription: number;
    structure: StructureCommon;
  };

  public get f(): { [key: string]: AbstractControl } {
    return this.userForm?.controls;
  }

  public get fonctionControl(): AbstractControl {
    return this.userForm?.get("fonction");
  }

  public get fonctionDetailControl(): AbstractControl {
    return this.userForm?.get("fonctionDetail");
  }

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly structureService: StructureService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title,
    private readonly matomo: MatomoTracker
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
        email: [this.user.email, [Validators.required, EmailValidator]],
        fonction: [null, Validators.required],
        fonctionDetail: [null],
        nom: [
          this.user.nom,
          [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
        ],
        password: new UntypedFormControl(
          null,
          Validators.compose(PASSWORD_VALIDATOR)
        ),
        prenom: [
          this.user.prenom,
          [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
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
              this.matomo.trackEvent(
                "INSCRIPTION_STRUCTURE",
                "VALIDATION_ETAPE_2",
                "SUCCESS",
                1
              );
              this.scrollTop();
              this.toastService.success(
                "Félicitations, votre compte a été créé avec succès"
              );
            },
            error: () => {
              this.loading = false;
              this.matomo.trackEvent(
                "INSCRIPTION_STRUCTURE",
                "VALIDATION_ETAPE_2",
                "FAIL",
                0
              );
              this.toastService.error(
                "Veuillez vérifier les champs du formulaire"
              );
            },
          })
      );
    }
  }

  private scrollTop(): void {
    window.scroll({
      behavior: "smooth",
      left: 0,
      top: 0,
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.subscription.unsubscribe();
  }
}
