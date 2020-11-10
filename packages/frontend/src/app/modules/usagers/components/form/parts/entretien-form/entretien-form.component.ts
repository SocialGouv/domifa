import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { AppUser } from "../../../../../../../_common/model";





@Component({
  providers: [UsagerService],
  selector: "app-entretien-form",
  templateUrl: "./entretien-form.component.html",
})
export class EntretienFormComponent implements OnInit {
  public modal: any;

  @Input() public usager!: Usager;
  @Output() public usagerChange = new EventEmitter<Usager>();

  @Input() public editEntretien!: boolean;
  @Output() public editEntretienChange = new EventEmitter<boolean>();

  public me: AppUser;

  constructor(
    private usagerService: UsagerService,
    private notifService: ToastrService,
    private modalService: NgbModal,
    public authService: AuthService,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute
  ) {
    this.authService.currentUser.subscribe((user: AppUser) => {
      this.me = user;
    });
  }

  public ngOnInit() {
    this.titleService.setTitle("Entretien avec l'usager");

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerService.findOne(id).subscribe(
        (usager: Usager) => {
          this.usager = usager;
        },
        (error) => {
          this.router.navigate(["404"]);
        }
      );
    } else {
      this.router.navigate(["404"]);
    }
  }

  public getAttestation() {
    return this.usagerService.attestation(this.usager.id);
  }

  public nextStep(step: number) {
    this.usagerService
      .nextStep(this.usager.id, step)
      .subscribe((usager: Usager) => {
        this.router.navigate(["usager/" + this.usager.id + "/edit/documents"]);
      });
  }
}
