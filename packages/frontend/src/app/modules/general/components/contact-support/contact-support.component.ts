import { GeneralService } from "./../../services/general.service";
import { UserStructure } from "./../../../../../_common/model/user-structure/UserStructure.type";
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { validateUpload } from "../../../../shared/upload-validator";
import { CustomToastService } from "../../../shared/services/custom-toast.service";

import { AuthService } from "../../../shared/services/auth.service";
import { calcPossibleSecurityContexts } from "@angular/compiler/src/template_parser/binding_parser";

@Component({
  selector: "app-contact-support",
  templateUrl: "./contact-support.component.html",
  styleUrls: ["./contact-support.component.css"],
})
export class ContactSupportComponent implements OnInit {
  public submitted: boolean;
  public loading: boolean;
  public fileName: string;
  public contactForm: FormGroup;

  public me: UserStructure;

  constructor(
    private formBuilder: FormBuilder,
    private generalService: GeneralService,
    private toastService: CustomToastService,
    private authService: AuthService
  ) {}

  get f(): { [key: string]: AbstractControl } {
    return this.contactForm.controls;
  }

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;

    let hasAccount = false;
    let email = "";
    let name = "";
    let structureName = "";
    let userId = "";
    let structureId = "";

    console.log(this.me);

    if (this.me) {
      email = this.me.structure.email;
      name = this.me.nom;
      structureName = this.me.structure.nom;
      structureId = this.me.structure.id.toString();
      userId = this.me.id.toString();

      hasAccount = true;
    }

    this.contactForm = this.formBuilder.group({
      content: ["", [Validators.required, Validators.minLength(10)]],
      email: [email, [Validators.required, Validators.email]],
      file: [""],
      fileSource: ["", [validateUpload("USAGER_DOC", false)]],
      hasAccount: [hasAccount, [Validators.required]],
      name: [name, [Validators.required, Validators.minLength(2)]],
      structureId: [structureId, []],
      structureName: [structureName, []],
      userId: [userId, []],
    });
  }

  public onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    this.fileName = file.name;
    this.contactForm.patchValue({
      fileSource: file,
    });
  }

  public sendContactMessage(): void {
    this.submitted = true;

    if (this.contactForm.invalid) {
      this.toastService.error("Le formulaire d'upload comporte des erreurs");
      return;
    }

    this.loading = true;

    const formData = new FormData();

    if (this.contactForm.controls.fileSource.value) {
      formData.append("file", this.contactForm.controls.fileSource.value);
    }

    formData.append("name", this.contactForm.controls.name.value);
    formData.append("userId", this.contactForm.controls.userId.value);
    formData.append("structureId", this.contactForm.controls.structureId.value);
    formData.append(
      "structureName",
      this.contactForm.controls.structureName.value
    );

    formData.append("hasAccount", this.contactForm.controls.hasAccount.value);
    console.log(this.contactForm.value);
    formData.append("email", this.contactForm.controls.email.value);
    formData.append("content", this.contactForm.controls.content.value);

    console.log(formData);
    this.generalService.sendContact(formData).subscribe({
      next: (response) => {
        console.log(response);
        this.fileName = "";
        this.loading = false;
        this.submitted = false;
        this.contactForm.reset();
        this.toastService.success("Fichier uploadé avec succès");
      },
      error: () => {
        this.loading = false;
        this.toastService.error("Impossible d'uploader le fichier");
      },
    });
  }
}
