import { TestBed } from "@angular/core/testing";
import { AppStoreModel } from "../AppStoreModel.type";
import {
  cacheManager,
  selectSearchPageLoadedUsagersData,
} from "../ngRxUsagersCache.service";
import { StoreModule, Store } from "@ngrx/store";
import { _usagerReducer } from "../ngRxAppStore.service";
import { UsagerLight } from "../../../../_common/model";
describe("Usager Reducer", () => {
  let store: Store<AppStoreModel>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ app: _usagerReducer })],
    });

    store = TestBed.inject(Store);
  });

  it("should handle addUsager", () => {
    const usager = { ref: "123", nom: "John Doe" } as unknown as UsagerLight;
    const action = cacheManager.addUsager({ usager });

    store.dispatch(action);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentState: any;

    store.select(selectSearchPageLoadedUsagersData).subscribe((state) => {
      currentState = state;
    });
    expect(currentState).toBeDefined();
  });

  it("should handle updateUsagerNotes", () => {
    const usagerRef = "123";
    const action = cacheManager.updateUsagerNotes({
      ref: usagerRef,
      nbNotes: 1,
    });

    store.dispatch(action);
  });
});
