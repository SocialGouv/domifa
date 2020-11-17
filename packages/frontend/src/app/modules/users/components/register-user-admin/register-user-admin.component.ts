import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { AppUser } from "../../../../../_common/model";
import { fadeInOut } from "../../../../shared/animations";
import { regexp } from "../../../../shared/validators";
import { appUserBuilder } from "../../services";
import { UsersService } from "../../services/users.service";

@Component({
  animations: [fadeInOut],
  selector: "app-register-user-admin",
  styleUrls: ["./register-user-admin.component.css"],
  templateUrl: "./register-user-admin.component.html",
})
export class RegisterUserAdminComponent implements OnInit {
  public user: AppUser;
  public userForm: FormGroup;

  public submitted: boolean;

  public emailExist: boolean = false;

  @ViewChild("form", { static: true })
  public form!: ElementRef<any>;

  get f() {
    return this.userForm.controls;
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: UsersService,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    this.user = appUserBuilder.buildAppUser({});
    this.submitted = false;
  }

  public ngOnInit() {
    this.titleService.setTitle("Inscription sur Domifa");

    this.userForm = this.formBuilder.group({
      email: [
        this.user.email,
        [Validators.pattern(regexp.email), Validators.required],
        this.validateEmailNotTaken.bind(this),
      ],
      nom: [this.user.nom, Validators.required],
      role: [this.user.role, Validators.required],
      prenom: [this.user.prenom, Validators.required],
    });
  }

  public submitUser() {
    this.submitted = true;
    if (this.userForm.invalid) {
      this.notifService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire",
        "Erreur dans le formulaire"
      );
    } else {
      this.userService.registerUser(this.userForm.value).subscribe(
        (retour: boolean) => {
          this.form.nativeElement.reset();
          this.notifService.success(
            "Votre collaborateur vient de recevoir un email pour ajouter son mot de passe.",
            "Le nouveau compte a été créé avec succès !"
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
