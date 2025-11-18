import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { SortValues } from "@domifa/common";
import { Subject, Subscription } from "rxjs";

import {
  AdminStructuresApiClient,
  CustomToastService,
} from "../../../shared/services";
import { StructureAdmin } from "../../types";
import { StructureFilterCriteria } from "../../utils";
import { FilterOutput } from "../admin-structures-list/admin-structures-list.component";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-admin-structures-table",
  templateUrl: "./admin-structures-table.component.html",
})
export class AdminStructuresTableComponent implements OnInit, OnDestroy {
  @Input()
  public structures?: StructureAdmin[] = [];
  @Input()
  public filters!: StructureFilterCriteria;

  @Output()
  public readonly sort = new EventEmitter<FilterOutput>();

  @ViewChild("addUserModal")
  public addUserModal!: DsfrModalComponent;

  public currentStructure: StructureAdmin | undefined = undefined;
  public structureToDelete: StructureAdmin | undefined = undefined;
  public structureToRefuse: StructureAdmin | undefined = undefined;

  public submitted = false;

  public loading = false;
  public exportLoading = false;
  public sortValue: SortValues = "desc";
  public currentKey: keyof StructureAdmin = "id";

  public reloadStructures$: Subject<void> = new Subject();
  private readonly subscription = new Subscription();

  constructor(
    private readonly adminStructuresApiClient: AdminStructuresApiClient,
    private readonly toastService: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.reloadStructures$.subscribe(() =>
        this.adminStructuresApiClient.getAdminStructureListData().subscribe()
      )
    );
  }

  public idTrackBy(_index: number, item: StructureAdmin) {
    return item.id;
  }

  public refuseModal(structure: StructureAdmin) {
    this.structureToRefuse = structure;
  }
  public openDeleteModal(structure: StructureAdmin) {
    this.structureToDelete = structure;
  }

  public deleteStructure(structureUuid: string): void {
    this.subscription.add(
      this.adminStructuresApiClient
        .deleteSendInitialMail(structureUuid)
        .subscribe({
          next: () => {
            this.toastService.success(
              "Vous venez de recevoir un email vous permettant de supprimer la structure"
            );
          },
          error: () => {
            this.toastService.error(
              "Une erreur innatendue a eu lieu. Veuillez rééssayer dans quelques minutes"
            );
          },
        })
    );
  }

  public confirmStructure(structure: StructureAdmin) {
    this.subscription.add(
      this.adminStructuresApiClient
        .setDecisionStructure(structure.id, "VALIDE")
        .subscribe({
          next: () => {
            structure.statut = "VALIDE";
            this.toastService.success("Structure vérifiée avec succès");
          },
          error: () => {
            this.toastService.error("Impossible de valider la structure");
          },
        })
    );
  }

  public openAddAdminModal(structure: StructureAdmin): void {
    this.addUserModal.open();
    this.currentStructure = structure;
  }

  public cancelForm(): void {
    this.currentStructure = undefined;
    this.structureToDelete = undefined;
    this.structureToRefuse = undefined;
    this.submitted = false;
    this.addUserModal?.close();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
