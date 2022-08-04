import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

import { UsagerFormModel } from "./../../../usager-shared/interfaces/UsagerFormModel";
import { UsagerLight, UserStructure } from "src/_common/model";

@Component({
  selector: "app-step-footer",
  templateUrl: "./step-footer.component.html",
  styleUrls: ["./step-footer.component.css"],
})
export class StepFooterComponent implements OnInit {
  public me!: UserStructure;
  @Input() public usager!: UsagerFormModel;
  @Output() usagerChanges = new EventEmitter<UsagerLight>();

  @ViewChild("addNoteInModal", { static: true })
  public addNoteInModal!: TemplateRef<NgbModalRef>;

  constructor(private readonly modalService: NgbModal) {}

  ngOnInit(): void {}

  public onUsagerChanges(usager: UsagerLight): void {
    this.usagerChanges.emit(usager);
    this.usager = new UsagerFormModel(usager);
  }

  public openAddNoteInModal(): void {
    this.modalService.open(this.addNoteInModal);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }
}
