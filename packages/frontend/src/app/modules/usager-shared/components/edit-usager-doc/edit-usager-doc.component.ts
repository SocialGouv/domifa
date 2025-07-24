import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormGroup,
  AbstractControl,
  Validators,
  UntypedFormBuilder,
} from "@angular/forms";
import { Usager, UsagerDoc, WithLoading } from "@domifa/common";
import { Subscription } from "rxjs";
import { CustomToastService } from "../../../shared/services";
import { DocumentService } from "../../services";
import { NoWhiteSpaceValidator } from "../../../../shared";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../_common/model";

export type DocumentPatchForm = Pick<UsagerDoc, "label" | "shared">;

@Component({
  selector: "app-edit-usager-doc",
  templateUrl: "./edit-usager-doc.component.html",
  styleUrls: ["./edit-usager-doc.component.css"],
})
export class EditUsagerDocComponent implements OnInit, OnDestroy {
  public submitted = false;
  public loading = false;
  public documentForm!: UntypedFormGroup;
  private readonly subscription = new Subscription();

  @Input() public usager: Pick<Usager, "ref" | "options">;
  @Input() public doc: WithLoading<UsagerDoc>;
  @Output() public readonly docChange = new EventEmitter<
    WithLoading<UsagerDoc>
  >();

  @ViewChild("editDocumentModal", { static: true })
  public editDocumentModal!: TemplateRef<NgbModalRef>;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly documentService: DocumentService,
    private readonly toastService: CustomToastService,
    private readonly modalService: NgbModal
  ) {}

  public openModal(): void {
    this.modalService.open(this.editDocumentModal, DEFAULT_MODAL_OPTIONS);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public get u(): { [key: string]: AbstractControl } {
    return this.documentForm.controls;
  }

  public ngOnInit(): void {
    this.documentForm = this.formBuilder.group({
      label: [
        this.doc.label,
        [
          Validators.required,
          NoWhiteSpaceValidator,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      shared: [this.doc.shared, Validators.required],
    });
  }

  public patchDocument() {
    if (this.documentForm.invalid) {
      this.toastService.error("Le formulaire d'édition comporte des erreurs");
      return;
    }

    this.loading = true;

    this.subscription.add(
      this.documentService
        .patchDocument(this.documentForm.value, this.usager.ref, this.doc.uuid)
        .subscribe({
          next: (doc: UsagerDoc) => {
            this.docChange.emit({ ...doc, loading: false });
            this.toastService.success("Fichier modifié avec succès");
            this.loading = false;
            this.closeModals();
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible d'uploader le fichier");
          },
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
