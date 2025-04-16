import isEmail from "validator/lib/isEmail";
import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";

import { Observable, Subject, Subscription, of } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import {
  EmailValidator,
  fadeInOut,
  NoWhiteSpaceValidator,
} from "../../../../shared";
import { CustomToastService } from "../../../shared/services";

import { UserSupervisor } from "@domifa/common";
import { UsersService } from "../../../users/services";

export type FormEmailTakenValidator = Observable<null | {
  emailTaken: boolean;
}>;

@Component({
  animations: [fadeInOut],
  selector: "app-register-user-admin",
  templateUrl: "./register-user-admin.component.html",
})
export class RegisterUserAdminComponent implements OnInit, OnDestroy {
  public user: UserSupervisor;
  public userForm!: UntypedFormGroup;

  public submitted: boolean;
  public loading: boolean;

  public emailExist = false;

  private subscription = new Subscription();
  private unsubscribe: Subject<void> = new Subject();

  @Output() public getUsers = new EventEmitter<void>();

  @ViewChild("form", { static: true })
  public form!: ElementRef<HTMLFormElement>;

  public get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly usersService: UsersService,
    private readonly toastService: CustomToastService
  ) {
    this.user = null;
    this.loading = false;
    this.submitted = false;
  }

  public ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      email: [
        this.user?.email,
        [Validators.required, EmailValidator],
        this.validateEmailNotTaken.bind(this),
      ],
      nom: [
        this.user.nom,
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
      role: [this.user.role, Validators.required],
      prenom: [
        this.user.prenom,
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
    });
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
        this.usersService.registerUser(this.userForm.value).subscribe({
          next: () => {
            this.loading = false;
            this.submitted = false;
            this.getUsers.emit();
            this.form.nativeElement.reset();
            this.toastService.success(
              "Le nouveau compte a été créé avec succès, votre collaborateur vient de recevoir un email pour ajouter son mot de passe."
            );
          },
          error: () => {
            this.loading = false;
            this.toastService.error(
              "veuillez vérifier les champs marqués en rouge dans le formulaire"
            );
          },
        })
      );
    }
  }

  public validateEmailNotTaken(
    control: AbstractControl
  ): FormEmailTakenValidator {
    return isEmail(control.value)
      ? this.usersService.validateEmail(control.value).pipe(
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
    this.subscription.unsubscribe();
  }
}
