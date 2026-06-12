import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { StructureAdmin } from "@domifa/common";

export const StructuresActions = createActionGroup({
  source: "Structures",
  events: {
    "Load If Needed": emptyProps(),
    Load: emptyProps(),
    "Load Success": props<{ structures: StructureAdmin[] }>(),
    "Load Failure": props<{ error: string }>(),
    "Update One": props<{ structure: StructureAdmin }>(),
    Reset: emptyProps(),
  },
});
