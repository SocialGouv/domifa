import { UsagerNote } from "..";

export type UsagerPinnedNote = Pick<
  UsagerNote,
  "createdAt" | "usagerRef" | "message" | "createdBy"
> | null;
