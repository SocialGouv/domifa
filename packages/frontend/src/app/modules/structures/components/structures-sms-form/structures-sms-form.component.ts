import { noWhiteSpace } from "../../../../shared/validators/whitespace.validator";
import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { StructureCommon } from "../../../../../_common/model";

import { StructureService } from "../../services/structure.service";
import { MatomoTracker } from "@ngx-matomo/tracker";
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { generateSender } from "../../services";

@Component({
  selector: "app-structures-sms-form",
  templateUrl: "./structures-sms-form.component.html",
  styleUrls: ["./structures-sms-form.component.css"],
})
export class StructuresSmsFormComponent implements OnInit, OnDestroy {
  public structure!: StructureCommon;

  public loading: boolean;
  public submitted: boolean;
  public structureSmsForm!: UntypedFormGroup;

  @ViewChild("tutoModal", { static: true })
  public tutoModal!: TemplateRef<NgbModalRef>;

  public modalOptions: NgbModalOptions;
  private subscription = new Subscription();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly structureService: StructureService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title,
    private readonly matomo: MatomoTracker,
    private readonly modalService: NgbModal
  ) {
    this.loading = false;
    this.submitted = false;

    this.modalOptions = {
      centered: true,
      backdrop: "static",
      ariaLabelledBy: "modal-title",
    };
  }

  public get form(): { [key: string]: AbstractControl } {
    return this.structureSmsForm.controls;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Paramétrer les SMS");
    this.subscription.add(
      this.structureService.findMyStructure().subscribe({
        next: (structure: StructureCommon) => {
          this.structure = structure;

          if (!this.structure.sms.senderDetails) {
            this.structure.sms.senderDetails = this.structure.nom.substring(
              0,
              30
            );
          }

          if (!this.structure.sms.senderName) {
            this.structure.sms.senderName = generateSender(this.structure.nom);
          }

          this.initForm();
        },
        error: () => {
          this.toastService.success(
            "Impossible de récupérer les infos de ma structure"
          );
        },
      })
    );
  }

  public initForm() {
    this.structureSmsForm = this.formBuilder.group({
      enabledByStructure: [
        this.structure.sms.enabledByStructure,
        [Validators.required],
      ],
      senderName: [
        this.structure.sms.senderName,
        [
          Validators.required,
          noWhiteSpace,
          Validators.maxLength(11),
          Validators.pattern("^[a-zA-Z ]*$"),
        ],
      ],
      senderDetails: [
        this.structure.sms.senderDetails,
        [Validators.required, Validators.maxLength(30), noWhiteSpace],
      ],
    });
  }

  public submitStructureSmsForm() {
    this.submitted = true;

    if (this.structureSmsForm.invalid) {
      this.toastService.error("Veuillez vérifier le formulaire");
      return;
    }

    this.loading = true;

    this.subscription.add(
      this.structureService
        .patchSmsParams(this.structureSmsForm.value)
        .subscribe({
          next: () => {
            this.submitted = false;
            this.toastService.success(
              "Paramètres des SMS mis à jour avec succès"
            );
            this.loading = false;
          },
          error: () => {
            this.toastService.error(
              "Impossible de mettre à jour les paramètres"
            );
            this.submitted = false;
            this.loading = false;
          },
        })
    );
  }

  public trackVideo(name: string): void {
    this.matomo.trackEvent("vues_videos_faq", name, "null", 1);
  }

  public openTutoModal(): void {
    this.modalService.open(this.tutoModal, this.modalOptions);
  }

  public closeTutoModal(): void {
    this.modalService.dismissAll();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
