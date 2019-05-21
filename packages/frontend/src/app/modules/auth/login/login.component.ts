import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { User } from '../../../entities/user';
import { password, regexp } from '../../../entities/validators';

@Component({
  selector: 'app-home',
  styleUrls: ['./login.css'],
  templateUrl: './login.html'
})
export class LoginComponent implements OnInit {
  public signinForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(regexp.email)]],
    password: ['', [Validators.required, Validators.minLength(password.min), Validators.maxLength(password.max)]],

  });

  public model: any = {};
  public loading = false;
  public error = '';
  public submitted = false;

  constructor(private fb: FormBuilder) {
  }

  public ngOnInit(): void {
    this.submitted = false;
  }

  public onSubmit() {
    this.submitted = true;
  }

  public signin(user: User) {
    this.loading = true;
  }
}

