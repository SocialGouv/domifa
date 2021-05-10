import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AppUser } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { InteractionService } from "../../../usagers/services/interaction.service";
import { UsagerService } from "../../../usagers/services/usager.service";

@Component({
  selector: "app-profil-head",
  templateUrl: "./profil-head.component.html",
  styleUrls: ["./profil-head.component.css"],
})
export class ProfilHeadComponent implements OnInit {
  @Input() public usager: UsagerFormModel;
  @Input() public me: AppUser;

  constructor(
    private interactionService: InteractionService,
    private authService: AuthService,
    private modalService: NgbModal,
    private nbgDate: NgbDateCustomParserFormatter,
    private notifService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private usagerService: UsagerService
  ) {}

  ngOnInit(): void {}
  public closeModals() {
    this.modalService.dismissAll();
  }
}
