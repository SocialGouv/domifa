import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { regexp } from 'src/app/shared/validators';
import { User } from '../../interfaces/user';
import { UsersService } from '../../services/users.service';

const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate(300, style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate(150, style({ opacity: 0 }))
  ])
])

@Component({
  animations: [fadeInOut],
  selector: 'app-register-user',
  styleUrls: ['./register-user.component.css'],
  templateUrl: './register-user.component.html',
})
export class RegisterUserComponent implements OnInit {

  public title: string;
  public user: User;
  public userForm: FormGroup;
  public submitted: boolean;

  public hidePassword: boolean;
  public successMessage: string;
  public errorMessage: string;

  private successSubject = new Subject<string>();
  private errorSubject = new Subject<string>();

  get f() {
    return this.userForm.controls;
  }

  constructor(private formBuilder: FormBuilder, private userService: UsersService) {

  }

  public ngOnInit() {
    this.title = "Inscription";
    this.hidePassword = true;
    this.user = new User({});
    this.user.structureId = 2;

    this.initForm();

    this.successSubject.subscribe((message) => { this.successMessage = message; this.errorMessage = null;});
    this.errorSubject.subscribe((message) => { this.errorMessage = message;this.successMessage = null;});
    this.successSubject.pipe(debounceTime(10000)).subscribe(() => this.successMessage = null);

  }

  public initForm() {
    this.userForm = this.formBuilder.group({
      email: [this.user.email, [Validators.email, Validators.required]],
      fonction: [this.user.fonction, Validators.required],
      nom: [this.user.nom, Validators.required],
      password: [this.user.phone, Validators.required],
      phone: [this.user.phone, [Validators.pattern(regexp.phone)]],
      prenom: [this.user.prenom, Validators.required],
      structureId: [this.user.structureId, []],
    });
  }

  public submitUser() {
    this.submitted = true;
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        if (this.userForm.get(key).errors != null) {
          console.log(key);
          console.log(this.userForm.get(key));
          this.changeSuccessMessage("Un des champs du formulaire est incorrecte", true);
        }
      });
    }
    else {
      this.userService.create(this.userForm.value).subscribe((user: User) => {
        this.changeSuccessMessage("Votre compte a bien été créé");
        this.user = new User(user);
      }, (error) => {
        /* Todo : afficher le contenu des erreurs cote serveur */
        if (error.statusCode && error.statusCode === 400) {
          for (const message of error.message) {
            console.log(message.constraints);
          }
        }
        this.changeSuccessMessage("Une erreur dans le form", true);
      });
    }

  }

  public changeSuccessMessage(message: string, error?: boolean) {
    window.scroll({
      behavior: 'smooth',
      left: 0,
      top: 0,
    });
    error ? this.errorSubject.next(message) : this.successSubject.next(message);
  }


}
