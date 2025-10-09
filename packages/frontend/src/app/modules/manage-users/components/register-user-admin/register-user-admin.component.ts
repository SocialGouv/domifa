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

import { Subject, Subscription } from "rxjs";

import {
  EmailValidator,
  fadeInOut,
  NoWhiteSpaceValidator,
} from "../../../../shared";
import { AuthService, CustomToastService } from "../../../shared/services";

import { UserStructure } from "@domifa/common";
import { UsersService, userStructureBuilder } from "../../../users/services";

@Component({
  animations: [fadeInOut],
  selector: "app-register-user-admin",
  templateUrl: "./register-user-admin.component.html",
})
export class RegisterUserAdminComponent implements OnInit, OnDestroy {
  public user: UserStructure;
  public userForm!: UntypedFormGroup;

  public submitted: boolean;
  public loading: boolean;

  private readonly subscription = new Subscription();
  private readonly unsubscribe: Subject<void> = new Subject();
  public me!: UserStructure | null;

  @Output() public getUsers = new EventEmitter<void>();

  @ViewChild("form", { static: true })
  public form!: ElementRef<HTMLFormElement>;

  public get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  public get fonctionFormControl(): AbstractControl {
    return this.userForm.get("fonction");
  }

  public get fonctionDetailFormControl(): AbstractControl {
    return this.userForm.get("fonctionDetail");
  }

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly usersService: UsersService,
    private readonly toastService: CustomToastService,
    private readonly authService: AuthService
  ) {
    this.user = userStructureBuilder.buildUserStructure({});
    this.loading = false;
    this.submitted = false;
  }

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;

    this.userForm = this.formBuilder.group({
      email: [this.user.email, [Validators.required, EmailValidator]],
      nom: [
        this.user.nom,
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
      role: [this.user.role, Validators.required],
      prenom: [
        this.user.prenom,
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
      fonction: [
        this.user.fonction,
        [Validators.required, Validators.minLength(2)],
      ],
      fonctionDetail: [
        this.user.fonction,
        [Validators.minLength(2), Validators.minLength(255)],
      ],
      structureId: [this.user.structureId, []],
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
        this.usersService
          .registerUser({
            ...this.userForm.value,
            structureId: this.me.structureId,
          })
          .subscribe({
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

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.subscription.unsubscribe();
  }
}
