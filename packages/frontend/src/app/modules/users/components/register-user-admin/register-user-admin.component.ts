import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { UserStructure } from "../../../../../_common/model";
import { fadeInOut } from "../../../../shared/animations";
import { regexp } from "../../../../shared/constants/REGEXP.const";
import { userStructureBuilder } from "../../services";
import { UsersService } from "../../services/users.service";
import { noWhiteSpace } from "../../../../shared";

@Component({
  animations: [fadeInOut],
  selector: "app-register-user-admin",
  styleUrls: ["./register-user-admin.component.css"],
  templateUrl: "./register-user-admin.component.html",
})
export class RegisterUserAdminComponent implements OnInit {
  public user: UserStructure;
  public userForm!: FormGroup;

  public submitted: boolean;
  public loading: boolean;

  public emailExist = false;

  @ViewChild("form", { static: true })
  public form!: ElementRef<HTMLFormElement>;

  get f(): { [key: string]: AbstractControl } {
    return this.userForm.controls;
  }

  constructor(
    private readonly formBuilder: FormBuilder,
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
      this.userService.registerUser(this.userForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.submitted = false;
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
      });
    }
  }

  public validateEmailNotTaken(control: AbstractControl) {
    const testEmail = RegExp(regexp.email).test(control.value);
    return testEmail
      ? this.userService.validateEmail(control.value).pipe(
          map((res: boolean) => {
            console.log(res);
            return res === false ? null : { emailTaken: true };
          })
        )
      : of(null);
  }
}
