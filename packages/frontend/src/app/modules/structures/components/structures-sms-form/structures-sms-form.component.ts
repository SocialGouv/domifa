import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AppUser, StructureCommon } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { StructureService } from "../../services/structure.service";

@Component({
  selector: "app-structures-sms-form",
  templateUrl: "./structures-sms-form.component.html",
  styleUrls: ["./structures-sms-form.component.css"],
})
export class StructuresSmsFormComponent implements OnInit {
  public me: AppUser;
  public structure: StructureCommon;

  public submitted: boolean;
  public structureSmsForm!: FormGroup;

  get form() {
    return this.structureSmsForm.controls;
  }
  constructor(
    private formBuilder: FormBuilder,
    private structureService: StructureService,
    private notifService: ToastrService,
    private authService: AuthService,
    private modalService: NgbModal,
    private titleService: Title
  ) {}

  public ngOnInit(): void {
    this.structureSmsForm = this.formBuilder.group({
      senderName: ["", [Validators.required, Validators.maxLength(11)]],
      senderDetails: ["", [Validators.required, Validators.maxLength(30)]],
    });
  }

  public submitStructureSmsForm() {}
}
