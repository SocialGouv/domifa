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

import { of, Subject, Subscription } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import {
  FormEmailTakenValidator,
  UserStructure,
} from "../../../../../_common/model";
import { fadeInOut, regexp, noWhiteSpace } from "../../../../shared";
import { CustomToastService } from "../../../shared/services";
import { UsersService, userStructureBuilder } from "../../services";

@Component({
  animations: [fadeInOut],
  selector: "app-register-user-admin",
  styleUrls: ["./register-user-admin.component.css"],
  templateUrl: "./register-user-admin.component.html",
})
export class RegisterUserAdminComponent implements OnInit, OnDestroy {
  public user: UserStructure;
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
    private readonly userService: UsersService,
    private readonly toastService: CustomToastService
  ) {
    this.user = userStructureBuilder.buildUserStructure({});
    this.loading = false;
    this.submitted = false;
  }

  public ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      email: [
        this.user.email,
        [Validators.pattern(regexp.email), Validators.required],
        this.validateEmailNotTaken.bind(this),
      ],
      nom: [
        this.user.nom,
        [Validators.required, Validators.minLength(2), noWhiteSpace],
      ],
      role: [this.user.role, Validators.required],
      prenom: [
        this.user.prenom,
        [Validators.required, Validators.minLength(2), noWhiteSpace],
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
        this.userService.registerUser(this.userForm.value).subscribe({
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
    this.subscription.unsubscribe();
  }
}
