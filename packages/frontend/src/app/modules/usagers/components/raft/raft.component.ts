import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "src/app/modules/users/interfaces/user";
import { AuthService } from "src/app/services/auth.service";
import { motifsRadiation } from "../../../../shared/entretien.labels";
import { Usager } from "../../interfaces/usager";
import { UsagerService } from "../../services/usager.service";

@Component({
  providers: [UsagerService, AuthService],
  selector: "app-raft",
  styleUrls: ["./raft.component.css"],
  templateUrl: "./raft.component.html"
})
export class RaftComponent implements OnInit {
  public title: string;
  public usager: Usager;
  public user: User;

  public today: Date;

  public success: boolean;
  public error: boolean;

  public motifList: any;
  public motifsRadiation: any = motifsRadiation;

  constructor(
    private usagerService: UsagerService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public ngOnInit() {
    this.today = new Date();

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.authService.currentUser.subscribe(user => {
        this.user = user;
        this.motifList = Object.keys(motifsRadiation);
      });

      this.usagerService.findOne(id).subscribe(
        (usager: Usager) => {
          this.usager = new Usager(usager);
        },
        error => {
          this.router.navigate(["/404"]);
        }
      );
    } else {
      this.router.navigate(["/404"]);
      return;
    }
  }

  public setDecision(statut: string) {
    this.usagerService
      .setDecision(this.usager.id, this.usager.decision, statut)
      .subscribe(
        (usager: Usager) => {
          this.usager = usager;
          this.success = true;
        },
        error => {
          this.error = true;
        }
      );
  }
}
