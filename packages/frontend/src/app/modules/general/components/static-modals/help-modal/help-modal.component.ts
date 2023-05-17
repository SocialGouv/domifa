import { Component, TemplateRef, ViewChild } from "@angular/core";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../../_common/model";

@Component({
  selector: "app-help-modal",
  templateUrl: "./help-modal.component.html",
  styleUrls: ["./help-modal.component.css"],
})
export class HelpModalComponent {
  @ViewChild("helpCenter", { static: true })
  public helpCenter!: TemplateRef<NgbModalRef>;

  constructor(private readonly modalService: NgbModal) {}

  public openHelpModal(): void {
    this.modalService.open(this.helpCenter, DEFAULT_MODAL_OPTIONS);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }
}
