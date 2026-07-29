import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription, switchMap } from "rxjs";

import { AuthService } from "../../../shared/services/auth.service";
import { CustomToastService } from "../../../shared/services";
import { CguComponent } from "../static-pages/cgu/cgu.component";

@Component({
  selector: "app-accept-cgu",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CguComponent],
  templateUrl: "./accept-cgu.component.html",
})
export class AcceptCguComponent implements OnInit, OnDestroy {
  public acceptTermsForm!: FormGroup;
  public loading = false;
  public submitted = false;

  private readonly subscription = new Subscription();

  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(CustomToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);

  public get f(): { [key: string]: AbstractControl } {
    return this.acceptTermsForm.controls;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Acceptation des CGU - DomiFa");
    this.acceptTermsForm = this.formBuilder.group({
      acceptCgu: [null, [Validators.requiredTrue]],
    });
  }

  public submitAcceptTerms(): void {
    this.submitted = true;

    if (this.acceptTermsForm.invalid) {
      this.toastService.error("Veuillez cocher la case pour continuer");
      return;
    }

    this.loading = true;

    this.subscription.add(
      this.authService
        .acceptTerms()
        .pipe(switchMap(() => this.authService.isAuth()))
        .subscribe({
          next: () => {
            this.loading = false;
            this.toastService.success(
              "Merci, vous pouvez continuer votre navigation"
            );
            const returnUrl =
              this.route.snapshot.queryParamMap.get("returnUrl") ?? "/manage";
            this.router.navigateByUrl(returnUrl);
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Veuillez accepter les CGU pour continuer");
          },
        })
    );
  }

  public logout(): void {
    this.authService.logout();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
