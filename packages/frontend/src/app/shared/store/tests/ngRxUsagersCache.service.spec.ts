import { UsagerLight } from "../../../../_common/model";
import {
  _usagerReducer,
  initialUsagerState,
  selectAllUsagers,
  selectUsagerById,
  UsagerState,
} from "../usager-actions-reducer.service";
import { usagerActions } from "../usager-actions.service";
import {
  USAGER_VALIDE_MOCK,
  USAGER_REFUS_MOCK,
} from "../../../../_common/mocks";
import { TestBed } from "@angular/core/testing";
import { Store, StoreModule } from "@ngrx/store";
import { firstValueFrom } from "rxjs";

describe("UsagerReducer", () => {
  const mockUsager: UsagerLight = { ...USAGER_VALIDE_MOCK };
  let store: Store<UsagerState>;

  afterEach(() => {
    const action = usagerActions.clearCache();
    store.dispatch(action);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ app: _usagerReducer })],
    });

    store = TestBed.inject(Store);
  });

  it("should handle addUsager", () => {
    const usager = USAGER_VALIDE_MOCK;
    const action = usagerActions.addUsager({ usager });
    store.dispatch(action);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentState: any;

    store.select(selectAllUsagers).subscribe((state) => {
      currentState = state;
    });

    expect(currentState).toBeDefined();
    expect(currentState.length).toEqual(1);
  });
  it("should clear the cache", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentState: any;

    const action = usagerActions.clearCache();
    store.dispatch(action);

    store.select(selectAllUsagers).subscribe((state) => {
      currentState = state;
    });
    expect(currentState.length).toEqual(0);
  });

  it("should add a usager", () => {
    const action = usagerActions.addUsager({ usager: USAGER_VALIDE_MOCK });
    const state = _usagerReducer(initialUsagerState, action);

    expect(state.ids).toContain(mockUsager.ref);
    expect(state.entities[mockUsager.ref]).toEqual(mockUsager);
  });

  it("should update a usager", () => {
    usagerActions.addUsager({ usager: USAGER_VALIDE_MOCK });
    const updatedUsager = {
      ...USAGER_VALIDE_MOCK,
      nom: "Smith",
      prenom: "Will",
    };
    const action = usagerActions.updateUsager({ usager: updatedUsager });

    const previousState = {
      ...initialUsagerState,
      ids: [USAGER_VALIDE_MOCK.ref],
      entities: { [USAGER_VALIDE_MOCK.ref]: USAGER_VALIDE_MOCK },
    };

    const state = _usagerReducer(previousState, action);

    expect(state.entities[mockUsager.ref].nom).toEqual("Smith");
    expect(state.entities[mockUsager.ref].prenom).toEqual("Will");
  });

  it("should update a usager for manage", () => {
    usagerActions.addUsager({ usager: USAGER_VALIDE_MOCK });

    const updatedUsager = { ...mockUsager, nom: "Smith" };
    const action = usagerActions.updateUsagerForManage({
      usager: updatedUsager,
    });
    const previousState = {
      ...initialUsagerState,
      ids: [1],
      entities: { 1: mockUsager },
    };
    const state = _usagerReducer(previousState, action);

    expect(state.entities[mockUsager.ref]).toEqual(
      expect.objectContaining({ nom: "Smith" })
    );
  });

  it("should update many usagers for manage", async () => {
    store.dispatch(usagerActions.addUsager({ usager: USAGER_VALIDE_MOCK }));
    store.dispatch(usagerActions.addUsager({ usager: USAGER_REFUS_MOCK }));

    const updatedUsagerRefus = { ...USAGER_REFUS_MOCK, nom: "Nom refusé" };
    const updatedUsagerActif = { ...USAGER_VALIDE_MOCK, nom: "Nom validé" };

    store.dispatch(
      usagerActions.updateManyUsagersForManage({
        usagers: [updatedUsagerRefus, updatedUsagerActif],
      })
    );

    const usagerRefus = await firstValueFrom(
      store.select(selectUsagerById(USAGER_REFUS_MOCK.ref))
    );
    const usagerValide = await firstValueFrom(
      store.select(selectUsagerById(USAGER_VALIDE_MOCK.ref))
    );

    expect(usagerRefus.nom).toEqual("Nom refusé");
    expect(usagerValide.nom).toEqual("Nom validé");
    const all = await firstValueFrom(store.select(selectAllUsagers));
    expect(all.length).toEqual(2);
  });

  it("should update usager notes", async () => {
    store.dispatch(usagerActions.addUsager({ usager: USAGER_VALIDE_MOCK }));
    store.dispatch(
      usagerActions.updateUsagerNotes({
        ref: USAGER_VALIDE_MOCK.ref,
        nbNotes: 3,
      })
    );

    const usager = await firstValueFrom(
      store.select(selectUsagerById(USAGER_VALIDE_MOCK.ref))
    );

    expect(usager.nbNotes).toBe(3);
  });

  it("should delete usagers", () => {
    const previousState = {
      ...initialUsagerState,
      ids: [1, 2],
      entities: {
        1: mockUsager,
        "2": { ...mockUsager, ref: 2 },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const action = usagerActions.deleteUsagers({ usagerRefs: [1] });
    const state = _usagerReducer(previousState, action);

    expect(state.ids).not.toContain(1);
    expect(state.ids).toContain(2);
  });

  it("should load usagers successfully", () => {
    const usagers = [mockUsager, { ...mockUsager, ref: 2 }];
    const action = usagerActions.loadUsagersSuccess({
      usagers,
      usagersRadiesTotalCount: 5,
    });
    const state = _usagerReducer(initialUsagerState, action);

    expect(state.ids).toHaveLength(2);
    expect(state.dataLoaded).toBe(true);
    expect(state.usagersRadiesTotalCount).toBe(5);
  });
});
