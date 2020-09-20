import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";

import { ToastrService } from "ngx-toastr";
import * as labels from "src/app/modules/usagers/usagers.labels";
import { User } from "src/app/modules/users/interfaces/user";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";

@Component({
  providers: [UsagerService],
  selector: "app-entretien-form",
  templateUrl: "./entretien-form.component.html",
})
export class EntretienFormComponent implements OnInit {
  public labels: any;
  public modal: any;

  public typeMenageList: any;
  public residenceList: any;
  public causeList: any;
  public raisonList: any;

  public entretienForm!: FormGroup;

  @Input() public usager!: Usager;
  @Output() public usagerChange = new EventEmitter<Usager>();

  @Input() public editEntretien!: boolean;
  @Output() public editEntretienChange = new EventEmitter<boolean>();

  public me: User;

  constructor(
    private formBuilder: FormBuilder,
    private usagerService: UsagerService,
    private notifService: ToastrService,
    private modalService: NgbModal,
    public authService: AuthService,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute
  ) {
    this.authService.currentUser.subscribe((user: User) => {
      this.me = user;
    });
  }

  get e(): any {
    return this.entretienForm.controls;
  }

  public ngOnInit() {
    this.titleService.setTitle("État-civil du demandeur");

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

  public submitEntretien() {
    this.usagerService
      .entretien(this.entretienForm.value, this.usager.id)
      .subscribe(
        (usager: Usager) => {
          this.usagerChange.emit(usager);
          this.editEntretienChange.emit(false);
          this.notifService.success("Enregistrement de l'entretien réussi");
        },
        (error) => {
          this.notifService.error("Impossible d'enregistrer l'entretien");
        }
      );
  }

  public open(content: TemplateRef<any>) {
    this.modal = this.modalService.open(content);
  }

  public nextStep(step: number) {
    this.usagerService
      .nextStep(this.usager.id, step)
      .subscribe((usager: Usager) => {
        this.usager.etapeDemande = usager.etapeDemande;
      });
  }
}
