import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { SortValues, StructureAdmin } from "@domifa/common";
import { Subject, Subscription } from "rxjs";

import {
  AdminStructuresApiClient,
  CustomToastService,
} from "../../../shared/services";
import { StructureFilterCriteria } from "../../utils";
import { FilterOutput } from "../admin-structures-list/admin-structures-list.component";
import {
  DsfrDropdownMenuComponent,
  DsfrDropdownMenuItemComponent,
} from "@edugouvfr/ngx-dsfr-ext";
import { TableHeadSortComponent } from "../../../shared/components/table-head-sort/table-head-sort.component";
import { DisplayLastLoginComponent } from "../../../shared/components/display-last-login/display-last-login.component";
import { RegisterUserComponent } from "../../../structure/components/register-user/register-user.component";
import { StructureFormDeleteComponent } from "../structure-form-delete/structure-form-delete.component";
import { StructureFormRefuseComponent } from "../structure-form-refuse/structure-form-refuse.component";

@Component({
  selector: "app-admin-structures-table",
  templateUrl: "./admin-structures-table.component.html",
  imports: [
    CommonModule,
    RouterModule,
    DsfrDropdownMenuComponent,
    DsfrDropdownMenuItemComponent,
    TableHeadSortComponent,
    DisplayLastLoginComponent,
    RegisterUserComponent,
    StructureFormDeleteComponent,
    StructureFormRefuseComponent,
  ],
})
export class AdminStructuresTableComponent implements OnInit, OnDestroy {
  @Input()
  public structures?: StructureAdmin[] = [];
  @Input()
  public filters!: StructureFilterCriteria;

  @Output()
  public readonly sort = new EventEmitter<FilterOutput>();

  @ViewChild("registerUser")
  public registerUser!: RegisterUserComponent;

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
    if (!structure.uuid) {
      return;
    }
    this.subscription.add(
      this.adminStructuresApiClient
        .setDecisionStructure(structure.uuid, "VALIDE")
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
    this.registerUser.open(structure);
  }

  public cancelForm(): void {
    this.structureToDelete = undefined;
    this.structureToRefuse = undefined;
    this.submitted = false;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
