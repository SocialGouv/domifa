import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { Observable, of, Subject, Subscription } from "rxjs";

import { NoWhiteSpaceValidator } from "../../../../shared";
import { AuthService, CustomToastService } from "../../../shared/services";
import { USER_FONCTION_LABELS, UserStructure } from "@domifa/common";
import { format } from "date-fns";
import { UsagerLight } from "../../../../../_common/model";
import { userStructureBuilder } from "../../../users/services";
import { ManageUsersService } from "../../services/manage-users.service";

@Component({
  selector: "app-edit-user",
  templateUrl: "./edit-user.component.html",
  standalone: false,
})
export class EditUserComponent implements OnInit, OnDestroy {
  public me!: UserStructure | null;

  public submitted: boolean;
  public loading: boolean;

  public editUser: boolean;
  public editPassword: boolean;

  public usagers$: Observable<UsagerLight[]>;

  public userForm!: UntypedFormGroup;

  private readonly subscription = new Subscription();
  private readonly unsubscribe: Subject<void> = new Subject();
  public readonly USER_FONCTION_LABELS = USER_FONCTION_LABELS;

  public get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  public get lastPasswordUpdate(): string {
    return this.me?.passwordLastUpdate
      ? "Dernière modification: " +
          format(new Date(this.me.passwordLastUpdate), "dd/MM/yyyy")
      : "Aucune modification de mot de passe enregistrée";
  }

  public get fonctionFormControl(): AbstractControl {
    return this.userForm.get("fonction");
  }
  public get fonctionDetailFormControl(): AbstractControl {
    return this.userForm.get("fonctionDetail");
  }

  @ViewChild("userName")
  public firstInput!: ElementRef;

  constructor(
    private readonly authService: AuthService,
    private readonly manageUsersService: ManageUsersService,
    private readonly toastService: CustomToastService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly titleService: Title,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.submitted = false;
    this.editPassword = false;
    this.editUser = false;

    this.loading = false;
    this.usagers$ = of([]);
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Gérer mon compte - DomiFa");

    this.me = this.authService.currentUserValue;

    if (this.me?.role !== "facteur" && this.me?.role !== "agent") {
      this.usagers$ = this.manageUsersService.agenda();
    }
  }

  public initUserForm(): void {
    this.editUser = true;

    this.userForm = this.formBuilder.group({
      nom: [
        this.me?.nom,
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
      prenom: [
        this.me?.prenom,
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
      fonction: [
        this.me?.fonction,
        [Validators.required, Validators.minLength(2)],
      ],
      fonctionDetail: [
        this.me?.fonctionDetail,
        [Validators.minLength(2), Validators.maxLength(255)],
      ],
    });

    this.changeDetectorRef.detectChanges();
    const elementToFocus = this.firstInput?.nativeElement;
    if (elementToFocus) {
      elementToFocus.focus();
    }
  }

  public openPasswordForm(): void {
    this.editPassword = true;
  }

  public updateUser(): void {
    this.submitted = true;
    if (this.userForm.invalid) {
      this.toastService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire"
      );
      return;
    }
    this.loading = true;
    this.subscription.add(
      this.manageUsersService.patch(this.userForm.value).subscribe({
        next: (user: UserStructure) => {
          this.loading = false;
          this.me = userStructureBuilder.buildUserStructure(user);
          this.editUser = false;
          this.toastService.success(
            "Félicitations : vos informations ont été modifiées avec succès"
          );
        },
        error: () => {
          this.loading = false;
          this.toastService.error(
            "Veuillez vérifier les champs marqués en rouge dans le formulaire"
          );
        },
      })
    );
  }

  // The password-change endpoint terminates the current session server-side
  // (security policy) — the JWT we're holding is already invalid, so there's
  // nothing to refresh: log out and send the user back to login.
  public onPasswordChanged(): void {
    this.authService.logout();
  }

  public onPasswordCancel(): void {
    this.editPassword = false;
  }

  public ngOnDestroy(): void {
    this.unsubscribe.next();
    this.subscription.unsubscribe();
  }
}
