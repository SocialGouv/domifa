import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";

import { ToastrService } from "ngx-toastr";
import { AppUser, StructureCommon } from "../../../../../_common/model";
import { MessageSms } from "../../../../../_common/model/message-sms";
import { AuthService } from "../../../shared/services/auth.service";
import { interactionsLabels } from "../../../usagers/interactions.labels";
import { generateSender } from "../../services/generateSender.service";
import { StructureService } from "../../services/structure.service";

@Component({
  selector: "app-structures-sms-form",
  templateUrl: "./structures-sms-form.component.html",
  styleUrls: ["./structures-sms-form.component.css"],
})
export class StructuresSmsFormComponent implements OnInit {
  public me: AppUser;
  public structure: StructureCommon;

  public smsList: MessageSms[];
  public submitted: boolean;
  public structureSmsForm!: FormGroup;

  public interactionsLabels: any;

  constructor(
    private formBuilder: FormBuilder,
    private structureService: StructureService,
    private notifService: ToastrService,
    private authService: AuthService,
    private titleService: Title
  ) {
    this.interactionsLabels = interactionsLabels;
    this.smsList = [];
    this.me = null;
    this.structure = null;
    this.submitted = false;
  }

  get form() {
    return this.structureSmsForm.controls;
  }

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    this.titleService.setTitle("Paramétrer les SMS");

    this.structureService.findMyStructure().subscribe(
      (structure: StructureCommon) => {
        this.structure = structure;

        if (!this.structure.sms.senderDetails) {
          this.structure.sms.senderDetails = this.structure.nom.substring(
            0,
            30
          );
        }

        if (!this.structure.sms.senderName) {
          this.structure.sms.senderName = generateSender(
            this.structure.nom.substring(0, 11)
          );
        }

        this.initForm();
      },
      (error: any) => {
        this.notifService.success(
          "Impossible de récupérer les infos de ma structure"
        );
      }
    );

    this.structureService.smsTimeline().subscribe(
      (smsList: MessageSms[]) => {
        this.smsList = smsList;
      },
      (error: any) => {
        this.notifService.success("Impossible de récupérer les sms en attente");
      }
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
        [Validators.required, Validators.maxLength(11)],
      ],
      senderDetails: [
        this.structure.sms.senderDetails,
        [Validators.required, Validators.maxLength(30)],
      ],
    });

    this.structureSmsForm.get("senderName").valueChanges.subscribe(() => {
      this.structureSmsForm
        .get("senderName")
        .patchValue(
          generateSender(this.structureSmsForm.get("senderName").value),
          {
            emitEvent: false,
          }
        );
    });
  }

  public submitStructureSmsForm() {
    this.submitted = true;

    if (this.structureSmsForm.invalid) {
      this.notifService.error("Veuillez vérifier le formulaire");
    } else {
      this.structureService
        .patchSmsParams(this.structureSmsForm.value)
        .subscribe(
          (retour: any) => {
            this.submitted = false;
            this.notifService.success(
              "Paramètres des SMS mis à jour avec succès"
            );
          },
          (error: any) => {
            this.submitted = false;
            this.notifService.error(
              "Impossible de mettre à jour les paramètres"
            );
          }
        );
    }
  }
}
