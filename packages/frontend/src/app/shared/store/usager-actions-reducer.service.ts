import { createReducer, createSelector, on } from "@ngrx/store";
import { EntityAdapter, EntityState, createEntityAdapter } from "@ngrx/entity";
import { UsagerLight } from "../../../_common/model";

import { UsagerFormModel } from "../../modules/usager-shared/interfaces";
import { Usager } from "@domifa/common";
import { selectUsagerState, usagerActions } from "./usager-actions.service";
import { setUsagerInformation } from "./setUsagerInformation";

export interface UsagerState extends EntityState<UsagerLight> {
  dataLoaded: boolean;
  usagersRadiesTotalCount: number;
}

export const adapter: EntityAdapter<UsagerLight> =
  createEntityAdapter<UsagerLight>({
    selectId: (usager: UsagerLight) => usager.ref,
  });

export const initialUsagerState: UsagerState = adapter.getInitialState({
  dataLoaded: false,
  usagersRadiesTotalCount: 0,
});

export const _usagerReducer = createReducer(
  initialUsagerState,
  on(usagerActions.clearCache, () => initialUsagerState),

  on(usagerActions.addUsager, (state, { usager }) =>
    adapter.addOne(usager, state)
  ),
  on(usagerActions.updateUsager, (state, { usager }) => {
    return usager
      ? adapter.upsertOne(
          new UsagerFormModel(usager as Usager) as unknown as UsagerLight,
          state
        )
      : state;
  }),
  on(usagerActions.updateUsagerForManage, (state, { usager }) => {
    return usager
      ? adapter.upsertOne(
          setUsagerInformation(usager as unknown as UsagerLight),
          state
        )
      : state;
  }),
  on(usagerActions.updateManyUsagersForManage, (state, { usagers }) => {
    return usagers?.length
      ? adapter.upsertMany(
          usagers.map((usager) => setUsagerInformation(usager)),
          state
        )
      : state;
  }),
  on(usagerActions.deleteUsagers, (state, { usagerRefs }) => {
    if (!usagerRefs?.size) return state;

    const usagersToDelete = Array.from(usagerRefs)
      .map((ref) => state.entities[ref])
      .filter(Boolean);
    const radiesCount = usagersToDelete.filter(
      (usager) => usager.statut === "RADIE"
    ).length;

    const newState = adapter.removeMany(Array.from(usagerRefs), state);

    if (radiesCount > 0) {
      return {
        ...newState,
        usagersRadiesTotalCount: newState.usagersRadiesTotalCount - radiesCount,
      };
    }
    return newState;
  }),
  on(usagerActions.updateUsagerNotes, (state, { ref, nbNotes }) =>
    adapter.updateOne({ id: ref, changes: { nbNotes } }, state)
  ),
  on(
    usagerActions.loadUsagersSuccess,
    (state, { usagers, usagersRadiesTotalCount }) =>
      adapter.setAll(usagers, {
        ...state,
        dataLoaded: true,
        usagersRadiesTotalCount,
      })
  ),
  on(
    usagerActions.updateUsagersRadiesTotalCount,
    (
      state,
      {
        action,
        numberOfChanges,
      }: {
        action: "add" | "delete";
        numberOfChanges: number;
      }
    ) => {
      const usagersRadiesTotalCount =
        action === "add"
          ? state.usagersRadiesTotalCount + numberOfChanges
          : state.usagersRadiesTotalCount - numberOfChanges;
      return {
        ...state,
        usagersRadiesTotalCount,
      };
    }
  )
);

// get the selectors
const { selectIds, selectEntities, selectAll } = adapter.getSelectors();

export const selectUsagerIds = createSelector(selectUsagerState, selectIds);
export const selectUsagerEntities = createSelector(
  selectUsagerState,
  selectEntities
);
export const selectAllUsagers = createSelector(selectUsagerState, selectAll);

export const selectUsagerById = (id: number) =>
  createSelector(selectUsagerEntities, (entities) => entities[id]);

export const selectUsagerStateData = () =>
  createSelector(selectUsagerState, (state) => ({
    dataLoaded: state.dataLoaded,
    usagersRadiesTotalCount: state.usagersRadiesTotalCount,
  }));
