import { Component } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";
import { PortailUsagerProfile } from "@domifa/common";
import { Router } from "@angular/router";

@Component({
  selector: "app-usager-accept-cgu",
  templateUrl: "./usager-accept-cgu.component.html",
  styleUrls: ["./usager-accept-cgu.component.css"],
})
export class UsagerAcceptCguComponent {
  public acceptTermsForm!: FormGroup;

  public loading: boolean;
  public submitted: boolean;
  private subscription = new Subscription();
  public usagerProfile!: PortailUsagerProfile | null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly toastr: CustomToastService,
    private readonly usagerAuthService: UsagerAuthService,
    private readonly router: Router,
  ) {
    this.loading = false;
    this.submitted = false;

    this.usagerAuthService.currentUsagerSubject.subscribe(
      (apiResponse: PortailUsagerProfile | null) => {
        this.usagerProfile = apiResponse;
        if (apiResponse?.acceptTerms) {
          this.router.navigate(["/account"]);
        }
      },
    );
    this.initCguForm();
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.acceptTermsForm.controls;
  }

  private initCguForm() {
    this.acceptTermsForm = this.formBuilder.group({
      readTerms: [null, [Validators.requiredTrue]],
      acceptTerms: [null, [Validators.requiredTrue]],
    });
  }
  public submitAcceptTerms(): void {
    this.submitted = true;

    if (this.acceptTermsForm.invalid) {
      this.toastr.error("Veuillez accepter les CGU pour continuer");
      return;
    }

    this.loading = true;

    this.subscription.add(
      this.usagerAuthService.acceptTerms().subscribe({
        next: () => {
          this.submitted = false;
          this.loading = false;
          this.toastr.success("Merci, vous pouvez continuer votre navigation");

          this.router.navigate(["/account"]).then(() => {
            window.location.reload();
          });
        },
        error: () => {
          this.loading = false;
          this.toastr.error("Veuillez cocher les 2 cases pour continuer");
        },
      }),
    );
  }

  public logout(): void {
    this.usagerAuthService.logoutAndRedirect();
  }
}
