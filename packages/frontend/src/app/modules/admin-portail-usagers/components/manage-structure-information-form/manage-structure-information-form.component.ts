import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
  ValidationErrors,
} from "@angular/forms";
import {
  CustomToastService,
  NgbDateCustomParserFormatter,
} from "../../../shared/services";
import { StructureInformation } from "@domifa/common";
import { StructureInformationService } from "../../services/structure-information.service";

import {
  endDateAfterBeginDateCheck,
  formatDateToNgb,
} from "../../../../shared";
import { Subscription } from "rxjs";
import { EditorConfig } from "ckeditor5/src/core";
import {
  Bold,
  ClassicEditor,
  Essentials,
  Italic,
  List,
  Mention,
  Paragraph,
  Undo,
} from "ckeditor5";

@Component({
  selector: "app-manage-structure-information-form",
  templateUrl: "./manage-structure-information-form.component.html",
  styleUrls: ["./manage-structure-information-form.component.css"],
})
export class ManageStructureInformationFormComponent
  implements OnInit, OnDestroy
{
  public tempMessageForm!: FormGroup;
  public tempMessageTypes = ["closing", "opening-hours", "general", "other"];
  public subscription = new Subscription();

  public submitted = false;
  public loading = false;

  @Input() structureInformation: StructureInformation | null;

  @Output()
  public getStructureInformation = new EventEmitter<void>();

  public Editor = ClassicEditor;
  public config: EditorConfig = {
    toolbar: [
      "bold",
      "italic",
      "list",
      "bulletedList",
      "numberedList",
      "|",
      "undo",
      "redo",
    ],
    plugins: [Bold, Essentials, Italic, Mention, Paragraph, Undo, List],
    placeholder: "Contenu de l'information que vous souhaitez diffuser",
    language: "fr",
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: "https://",
      decorators: {
        openInNewTab: {
          mode: "manual",
          label: "Ouvrir dans un nouvel onglet",
          attributes: {
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
      },
    },
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly nbgDate: NgbDateCustomParserFormatter,
    private readonly structureInformationService: StructureInformationService,
    private readonly toastService: CustomToastService
  ) {}

  public get f(): { [key: string]: AbstractControl } {
    return this.tempMessageForm.controls;
  }

  ngOnInit(): void {
    this.initForm();

    this.subscription.add(
      this.tempMessageForm
        .get("isTemporary")
        ?.valueChanges.subscribe((value: boolean) => {
          const validator = value ? [Validators.required] : null;
          this.tempMessageForm.get("startDate")?.setValidators(validator);
          this.tempMessageForm.get("endDate")?.setValidators(validator);
          this.tempMessageForm.get("startDate")?.updateValueAndValidity();
          this.tempMessageForm.get("endDate")?.updateValueAndValidity();
        })
    );
  }

  initForm(): void {
    this.tempMessageForm = this.fb.group(
      {
        title: [this.structureInformation?.title ?? "", Validators.required],
        description: [
          this.structureInformation?.description ?? "",
          [
            Validators.required,
            Validators.minLength(10),
            this.ckeditorValidator(),
          ],
        ],
        startDate: [
          this.structureInformation?.startDate
            ? formatDateToNgb(this.structureInformation?.startDate)
            : null,
          this.structureInformation?.isTemporary ? Validators.required : null,
        ],
        endDate: [
          this.structureInformation?.endDate
            ? formatDateToNgb(this.structureInformation?.endDate)
            : null,
          this.structureInformation?.isTemporary ? Validators.required : null,
        ],
        type: [this.structureInformation?.type ?? "", Validators.required],
        isTemporary: [
          this.structureInformation?.isTemporary ?? false,
          Validators.required,
        ],
      },
      {
        validators: this.endDateAfterBeginDateValidator,
      }
    );
  }

  ckeditorValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return { required: true };
      }

      const div = document.createElement("div");
      div.innerHTML = value;
      const text = div.textContent || div.innerText || "";

      if (text.trim().length < 10) {
        return { minlength: true };
      }

      return null;
    };
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.tempMessageForm.valid) {
      const formData: Partial<StructureInformation> = {
        ...this.tempMessageForm.value,
        startDate:
          this.tempMessageForm.controls.isTemporary.value === true
            ? new Date(
                this.nbgDate.formatEn(
                  this.tempMessageForm.controls.startDate.value
                )
              )
            : null,
        endDate:
          this.tempMessageForm.controls.isTemporary.value === true
            ? new Date(
                this.nbgDate.formatEn(
                  this.tempMessageForm.controls.endDate.value
                )
              )
            : null,
      };

      if (this.structureInformation) {
        this.patchStructureInformation(formData);
      } else {
        this.postStructureInformation(formData);
      }
    } else {
      this.toastService.error("Veuillez vérifier le formulaire");
    }
  }

  private patchStructureInformation(formData: Partial<StructureInformation>) {
    this.subscription.add(
      this.structureInformationService
        .updateStructureInformation(this.structureInformation.uuid, formData)
        .subscribe({
          next: () => {
            this.loading = false;
            this.toastService.success("Informations mises à jour avec succès");
            this.getStructureInformation.emit();
          },
          error: () => {
            this.loading = false;
            this.toastService.error(
              "Impossible de mettre à jour les paramètres"
            );
          },
        })
    );
  }

  private postStructureInformation(formData: Partial<StructureInformation>) {
    this.subscription.add(
      this.structureInformationService
        .createStructureInformation(formData)
        .subscribe({
          next: () => {
            this.loading = false;
            this.toastService.success("Informations ajoutée avec succès");
            this.getStructureInformation.emit();
          },
          error: () => {
            this.loading = false;
            this.toastService.error(
              "Impossible de mettre à jour les paramètres"
            );
          },
        })
    );
  }

  private endDateAfterBeginDateValidator = (
    controls: AbstractControl
  ): ValidationErrors | null => {
    const beginDateControl: AbstractControl | null = controls.get("startDate");
    const endDateControl: AbstractControl | null = controls.get("endDate");

    return beginDateControl && endDateControl
      ? endDateAfterBeginDateCheck(beginDateControl, endDateControl)
      : null;
  };
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
