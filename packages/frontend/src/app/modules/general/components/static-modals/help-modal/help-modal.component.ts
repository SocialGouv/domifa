import { Component, TemplateRef, ViewChild } from "@angular/core";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";

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
    this.modalService.open(this.helpCenter, {
      centered: true,
      backdrop: "static",
      ariaLabelledBy: "modal-title",
    });
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }
}
