import { createAction, createFeatureSelector, props } from "@ngrx/store";

import { Usager } from "@domifa/common";
import { UsagerLight } from "../../../_common/model";
import { UsagerState } from "./usager-actions-reducer.service";

export const usagerActions = {
  clearCache: createAction("[Usager] Clear Cache"),
  addUsager: createAction("[Usager] Add Usager", props<{ usager: Usager }>()),
  updateUsager: createAction(
    "[Usager] Update Usager",
    props<{ usager: Partial<Usager | UsagerLight> }>()
  ),
  updateUsagerForManage: createAction(
    "[Usager] Update Usager for Manage",
    props<{ usager: Partial<Usager | UsagerLight> }>()
  ),
  updateManyUsagersForManage: createAction(
    "[Usager] Update Usager for Manage",
    props<{ usagers: Partial<Usager[] | UsagerLight[]> }>()
  ),
  deleteUsagers: createAction(
    "[Usager] Delete Usagers",
    props<{ usagerRefs: number[] }>()
  ),
  updateUsagerNotes: createAction(
    "[Usager] Update Usager Notes",
    props<{ ref: number; nbNotes: number }>()
  ),
  loadUsagersSuccess: createAction(
    "[Usager] Load Usagers Success",
    props<{ usagers: UsagerLight[]; usagersRadiesTotalCount: number }>()
  ),
  updateUsagersRadiesTotalCount: createAction(
    "[Usager] updateUsagersRadiesTotalCount",
    props<{ usagersRefsToDelete: number }>()
  ),
};
// Feature Selector
export const selectUsagerState = createFeatureSelector<UsagerState>("app");
