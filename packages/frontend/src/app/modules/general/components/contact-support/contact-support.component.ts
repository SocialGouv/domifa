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
import { Title, Meta } from "@angular/platform-browser";

@Component({
  selector: "app-contact-support",
  templateUrl: "./contact-support.component.html",
  styleUrls: ["./contact-support.component.css"],
})
export class ContactSupportComponent implements OnInit {
  public submitted: boolean;
  public success: boolean;
  public loading: boolean;
  public fileName: string;
  public contactForm: FormGroup;

  public me: UserStructure;

  constructor(
    private formBuilder: FormBuilder,
    private generalService: GeneralService,
    private toastService: CustomToastService,
    private authService: AuthService,
    private titleService: Title,
    private meta: Meta
  ) {
    this.me = null;
    this.success = false;
    this.loading = false;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.contactForm.controls;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Formulaire de contact");

    this.meta.updateTag({
      name: "description",
      content:
        "Vous avez une question ? Ce formulaire vous permettra de contacter l'équipe Domifa",
    });

    let email: string = null;
    let structureName: string = null;
    let name: string = null;
    let structureId: number = null;
    let userId: number = null;

    if (this.me) {
      email = this.me.email;
      structureName = this.me.structure.nom;
      structureId = this.me.structure.id;
      userId = this.me.id;
      name = this.me.nom + " " + this.me.prenom;
    }

    this.me = this.authService.currentUserValue;

    this.contactForm = this.formBuilder.group({
      content: ["", [Validators.required, Validators.minLength(10)]],
      email: [email || null, [Validators.required, Validators.email]],
      file: [""],
      fileSource: ["", [validateUpload("STRUCTURE_DOC", false)]],
      hasAccount: [this.me ? true : false, [Validators.required]],
      name: [name, [Validators.required, Validators.minLength(2)]],
      structureId: [structureId, []],
      structureName: [
        structureName,
        [Validators.required, Validators.minLength(2)],
      ],
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
    formData.append("email", this.contactForm.controls.email.value);
    formData.append("content", this.contactForm.controls.content.value);

    this.generalService.sendContact(formData).subscribe({
      next: () => {
        this.fileName = "";
        this.loading = false;
        this.success = true;
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
