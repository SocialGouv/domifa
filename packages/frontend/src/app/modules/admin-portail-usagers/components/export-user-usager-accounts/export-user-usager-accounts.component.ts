import { Component } from "@angular/core";
import { ManagePortailUsagersService } from "../../services/manage-portail-usagers.service";
import saveAs from "file-saver";

@Component({
  selector: "app-export-user-usager-accounts",
  templateUrl: "./export-user-usager-accounts.component.html",
  styleUrls: ["./export-user-usager-accounts.component.css"],
})
export class ExportUserUsagerAccountsComponent {
  public loading = false;
  constructor(
    private readonly managePortailUsagersService: ManagePortailUsagersService
  ) {}

  public exportAccountsToExcel(): void {
    this.loading = true;

    this.managePortailUsagersService.exportAccountsToExcel().subscribe({
      next: (blob: Blob) => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 19).replace(/:/g, "-");
        const fileName = `comptes_utilisateurs_${dateStr}.xlsx`;

        // Téléchargement avec file-saver
        saveAs(blob, fileName);

        this.loading = false;
      },
      error: (error) => {
        console.error("Erreur lors de l'export Excel:", error);
        this.loading = false;
      },
    });
  }
}
