import { AuthService } from "./../../../shared/services/auth.service";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { UsagerFormModel } from "./../../../usager-shared/interfaces/UsagerFormModel";
import { UsagerLight, UserStructure } from "src/_common/model";

@Component({
  selector: "app-step-footer",
  templateUrl: "./step-footer.component.html",
  styleUrls: ["./step-footer.component.css"],
})
export class StepFooterComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  @Output() usagerChanges = new EventEmitter<UsagerLight>();

  @ViewChild("addNoteInModal", { static: true })
  public addNoteInModal!: TemplateRef<any>;

  public me: UserStructure;

  constructor(
    private modalService: NgbModal,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });
  }

  public onUsagerChanges(usager: UsagerLight): void {
    this.usager = new UsagerFormModel(usager);
    this.usagerChanges.emit(this.usager);
  }

  public openAddNoteInModal(): void {
    this.modalService.open(this.addNoteInModal);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }
}
