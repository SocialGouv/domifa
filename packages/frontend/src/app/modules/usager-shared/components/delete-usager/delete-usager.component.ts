import { Component, Input, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Observable, Subscription, forkJoin } from "rxjs";
import { UserStructure } from "../../../../../_common/model";
import { CustomToastService } from "../../../shared/services";
import { UsagerProfilService } from "../../../usager-profil/services/usager-profil.service";

@Component({
  selector: "app-delete-usager",
  templateUrl: "./delete-usager.component.html",
  styleUrls: ["./delete-usager.component.css"],
})
export class DeleteUsagerComponent implements OnDestroy {
  @Input() public selectedRefs: number[];
  @Input() public context!: "MANAGE" | "PROFIL";
  @Input() public me!: UserStructure;

  private subscription = new Subscription();

  public loading: boolean;

  constructor(
    private readonly router: Router,
    private readonly modalService: NgbModal,
    private readonly usagerProfilService: UsagerProfilService,
    private readonly toastService: CustomToastService
  ) {
    this.loading = false;
  }

  public deleteUsager(): void {
    this.loading = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleteRequests: Observable<any>[] = this.selectedRefs.map(
      (ref: number) => {
        return this.usagerProfilService.delete(ref);
      }
    );

    this.subscription.add(
      forkJoin(deleteRequests).subscribe({
        next: () => {
          const message =
            this.selectedRefs.length > 1
              ? "Les dossiers sélectionnés ont été supprimé avec succès"
              : "Usager supprimé avec succès";
          this.toastService.success(message);
          this.modalService.dismissAll();
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(["/manage"]).then(() => {
              window.location.reload();
            });
          }, 1000);
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible de supprimer la fiche");
          window.location.reload();
        },
      })
    );
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
