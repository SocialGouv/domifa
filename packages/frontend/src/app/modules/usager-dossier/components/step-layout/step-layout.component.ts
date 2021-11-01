import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";

import { AuthService } from "src/app/modules/shared/services/auth.service";
import {
  UsagerLight,
  UserStructure,
  Usager,
} from "../../../../../_common/model";
import { UsagerFormModel } from "../../../usager-shared/interfaces/UsagerFormModel";
import { UsagerDossierService } from "../../services/usager-dossier.service";
import { fadeInOut } from "src/app/shared/animations";

@Component({
  animations: [fadeInOut],
  selector: "app-step-layout",
  templateUrl: "./step-layout.component.html",
  styleUrls: ["./step-layout.component.css"],
})
export class StepLayoutComponent implements OnInit {
  public usager!: UsagerFormModel;
  public me: UserStructure;
  public title: string;
  public filteredNotes: number;

  @ViewChild("addNoteInModal", { static: true })
  public addNoteInModal!: TemplateRef<any>;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private usagerDossierService: UsagerDossierService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerDossierService.findOne(id).subscribe({
        next: (usager: Usager) => {
          this.usager = new UsagerFormModel(usager);
          this.initLayoutData();
        },
        error: () => {
          this.router.navigate(["404"]);
        },
      });
    } else {
      this.usager = new UsagerFormModel();
      this.initLayoutData();
      this.title = "Nouvelle Domicilation";
    }
  }

  private initLayoutData(): void {
    const typeDomTtile =
      this.usager.typeDom === "PREMIERE_DOM"
        ? "Première demande"
        : "Renouvellement de";
    this.title = `${typeDomTtile} ${this.usager.nom} ${this.usager.prenom} ${
      this.usager.customRef || this.usager.ref
    }`;

    this.filteredNotes = this.usager.notes.filter(
      (note) => !note.archived
    ).length;

    console.log(this.usager);
  }

  public onUsagerChanges(usager: UsagerLight): void {
    this.usager = new UsagerFormModel(usager);
  }

  public openAddNoteInModal(): void {
    this.modalService.open(this.addNoteInModal);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }
}
