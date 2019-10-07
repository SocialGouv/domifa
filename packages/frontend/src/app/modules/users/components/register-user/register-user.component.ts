import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { fadeInOut } from "../../../../shared/animations";
import { User } from "../../interfaces/user";
import { PasswordValidator } from "../../services/password-validator.service";
import { UsersService } from "../../services/users.service";

@Component({
  animations: [fadeInOut],
  selector: "app-register-user",
  styleUrls: ["./register-user.component.css"],
  templateUrl: "./register-user.component.html"
})
export class RegisterUserComponent implements OnInit {
  get f() {
    return this.userForm.controls;
  }
  public title: string;
  public user: User;
  public userForm: FormGroup;

  public submitted: boolean;
  public success: boolean;

  public hidePassword: boolean;
  public hidePasswordConfirm: boolean;
  public successMessage: string;
  public errorMessage: string;

  @Input() public structureChild: any;

  private successSubject = new Subject<string>();
  private errorSubject = new Subject<string>();

  constructor(
    private formBuilder: FormBuilder,
    private userService: UsersService,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.title = "Inscription";
    this.hidePassword = true;
    this.hidePasswordConfirm = true;

    this.user = new User({});

    this.user.structureId =
      this.structureChild !== undefined
        ? this.structureChild.structureId
        : (this.user.structureId = parseInt(this.route.snapshot.params.id, 10));

    this.success = false;
    this.initForm();

    this.successSubject.subscribe(message => {
      this.successMessage = message;
      this.errorMessage = null;
    });

    this.errorSubject.subscribe(message => {
      this.errorMessage = message;
      this.successMessage = null;
      this.success = false;
    });

    this.successSubject
      .pipe(debounceTime(10000))
      .subscribe(() => (this.successMessage = null));
  }

  public initForm() {
    this.userForm = this.formBuilder.group(
      {
        confirmPassword: [null, Validators.compose([Validators.required])],
        email: [this.user.email, [Validators.email, Validators.required]],
        fonction: [this.user.fonction, Validators.required],
        nom: [this.user.nom, Validators.required],
        password: [
          null,
          Validators.compose([
            Validators.required,
            PasswordValidator.patternValidator(/\d/, {
              hasNumber: true
            }),
            PasswordValidator.patternValidator(/[A-Z]/, {
              hasCapitalCase: true
            }),
            Validators.minLength(12)
          ])
        ],
        prenom: [this.user.prenom, Validators.required],
        structureId: [this.user.structureId, []]
      },
      {
        validator: PasswordValidator.passwordMatchValidator
      }
    );
  }

  public submitUser() {
    this.submitted = true;
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        if (this.userForm.get(key).errors != null) {
          this.changeSuccessMessage(
            "veuillez vérifier les champs marqués en rouge dans le formulaire",
            true
          );
        }
      });
    } else {
      this.userService.create(this.userForm.value).subscribe(
        (user: User) => {
          this.user = new User(user);
          this.success = true;
          this.errorSubject.next(null);
          this.successSubject.next(null);
        },
        error => {
          if (error.message === "EMAIL_EXIST") {
            this.changeSuccessMessage(
              "Il existe déjà un compte utilisant cette adresse email",
              true
            );
          } else {
            this.changeSuccessMessage(
              "Une erreur inattendue est survenue, veuillez contacter l'équipe Domifa",
              true
            );
          }
        }
      );
    }
  }

  public changeSuccessMessage(message: string, erreur?: boolean) {
    window.scroll({
      behavior: "smooth",
      left: 0,
      top: 0
    });
    erreur
      ? this.errorSubject.next(message)
      : this.successSubject.next(message);
  }
}
