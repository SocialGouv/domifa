import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import {
  Order,
  PageOptions,
  PageResults,
  UsagersCountByStatus,
  UserUsagerWithUsagerInfo,
} from "@domifa/common";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../_common/model";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { ManagePortailUsagersService } from "../../services/manage-portail-usagers.service";
import { ManageUsagersService } from "../../../manage-usagers/services/manage-usagers.service";
import { fadeIn } from "../../../../shared";
import saveAs from "file-saver";

@Component({
  animations: [fadeIn],
  selector: "app-manage-user-usager",
  templateUrl: "./manage-user-usager.component.html",
  styleUrls: ["./manage-user-usager.component.css"],
})
export class ManageUserUsagerComponent implements OnInit {
  @ViewChild("activateAllAccountsModal", { static: true })
  public activateAllAccountsModal!: TemplateRef<NgbModalRef>;

  public params: PageOptions = {
    order: Order.DESC,
    page: 1,
    take: 50,
  };

  public searchResults: PageResults<UserUsagerWithUsagerInfo> = {
    data: [],
    meta: {
      page: 0,
      take: 0,
      itemCount: 0,
      pageCount: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
  public loading = false;
  public activatingAccounts = false;

  public userUsagerAccountsByStatus = new UsagersCountByStatus();
  public usagerCountByStatuts = new UsagersCountByStatus();

  constructor(
    private readonly managePortailUsagersService: ManagePortailUsagersService,
    private readonly manageUsagersService: ManageUsagersService,
    private readonly modalService: NgbModal,
    private readonly toastService: CustomToastService
  ) {}

  ngOnInit() {
    this.countUsagerByStatus();
    this.countUserUsagerAccountsByStatus();
    this.loadAccounts();
  }

  public loadAccounts(params?: PageOptions): void {
    this.loading = true;

    // Utilise les options passées en paramètre ou celles par défaut
    const options = params || this.params;

    this.managePortailUsagersService.getAllAccounts(options).subscribe({
      next: (results: PageResults<UserUsagerWithUsagerInfo>) => {
        this.searchResults = results;
        this.loading = false;
      },
      error: (error) => {
        console.error("Erreur lors du chargement des comptes:", error);
        this.loading = false;
      },
    });
  }

  public countUserUsagerAccountsByStatus(): void {
    this.managePortailUsagersService.getAllAccountsStats().subscribe({
      next: (results: UsagersCountByStatus) => {
        this.userUsagerAccountsByStatus = results;
      },
      error: (error) => {
        console.error("Erreur lors du chargement des stats:", error);
        this.loading = false;
      },
    });
  }

  public countUsagerByStatus(): void {
    this.manageUsagersService.countUsagersByStatuts().subscribe({
      next: (results: UsagersCountByStatus) => {
        this.usagerCountByStatuts = results;
      },
      error: (error) => {
        console.error("Erreur lors du chargement des stats:", error);
        this.loading = false;
      },
    });
  }

  public openActivateAllAccountsModal(): void {
    this.modalService.open(
      this.activateAllAccountsModal,
      DEFAULT_MODAL_OPTIONS
    );
  }

  public activateAllAccounts(): void {
    this.activatingAccounts = true;

    this.managePortailUsagersService.activateAllUserUsagerAccounts().subscribe({
      next: () => {
        this.activatingAccounts = false;
        this.modalService.dismissAll();
        this.toastService.success(
          "Tous les comptes ont été générés avec succès"
        );

        // Recharger les données pour refléter les changements
        this.loadAccounts();
        this.countUserUsagerAccountsByStatus();
      },
      error: (error) => {
        console.error("Erreur lors de la génération des comptes:", error);
        this.activatingAccounts = false;
        this.toastService.error("Erreur lors de la génération des comptes");
      },
    });
  }
  public exportAccountsToExcel(): void {
    this.loading = true;

    this.managePortailUsagersService.exportAccountsToExcel().subscribe({
      next: (blob: Blob) => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 19).replace(/:/g, "-");
        const fileName = `comptes_utilisateurs_${dateStr}.xlsx`;

        saveAs(blob, fileName);

        this.loading = false;
      },
      error: (error) => {
        console.error("Erreur lors de l'export Excel:", error);
        this.loading = false;
      },
    });
  }
  public closeModal(): void {
    this.modalService.dismissAll();
  }
}
