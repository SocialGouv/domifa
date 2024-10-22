import { Component, Input, OnInit } from "@angular/core";
import {
  UntypedFormGroup,
  AbstractControl,
  Validators,
  UntypedFormBuilder,
} from "@angular/forms";
import { Usager, UsagerDoc } from "@domifa/common";
import { Subscription } from "rxjs";
import { CustomToastService } from "../../../shared/services";
import { DocumentService } from "../../services";
import { NoWhiteSpaceValidator } from "../../../../shared";

export type DocumentPatchForm = Pick<UsagerDoc, "label" | "shared">;
@Component({
  selector: "app-edit-usager-doc",
  templateUrl: "./edit-usager-doc.component.html",
  styleUrls: ["./edit-usager-doc.component.css"],
})
export class EditUsagerDocComponent implements OnInit {
  public submitted = false;
  public loading = false;
  public documentForm!: UntypedFormGroup;
  private subscription = new Subscription();

  @Input() public document: UsagerDoc;
  @Input() public usager: Pick<Usager, "ref">;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly documentService: DocumentService,
    private readonly toastService: CustomToastService
  ) {}

  public get u(): { [key: string]: AbstractControl } {
    return this.documentForm.controls;
  }

  public ngOnInit(): void {
    this.documentForm = this.formBuilder.group({
      label: [
        this.document.label,
        [Validators.required, NoWhiteSpaceValidator, Validators.minLength(2)],
      ],
      shared: [this.document.shared, Validators.required],
    });
  }

  public patchDocument() {
    if (this.documentForm.invalid) {
      this.toastService.error("Le formulaire d'édition comporte des erreurs");
      return;
    }

    this.subscription.add(
      this.documentService
        .patchDocument(
          this.documentForm.value,
          this.usager.ref,
          this.document.uuid
        )
        .subscribe({
          next: () => {
            this.toastService.success("Fichier modifié avec succès");
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible d'uploader le fichier");
          },
        })
    );
  }
}
