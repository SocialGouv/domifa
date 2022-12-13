import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

import { UsagerFormModel } from "./../../../usager-shared/interfaces/UsagerFormModel";

@Component({
  selector: "app-step-footer",
  templateUrl: "./step-footer.component.html",
  styleUrls: ["./step-footer.component.css"],
})
export class StepFooterComponent {
  @Input() public usager!: UsagerFormModel;
  @Output() public usagerChange = new EventEmitter<UsagerFormModel>();

  @ViewChild("addNoteInModal", { static: true })
  public addNoteInModal!: TemplateRef<NgbModalRef>;

  constructor(private readonly modalService: NgbModal) {}

  public openAddNoteInModal(): void {
    this.modalService.open(this.addNoteInModal);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }
}
