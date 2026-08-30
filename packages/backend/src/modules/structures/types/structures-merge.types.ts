export type StructureMergeCustomRefRule =
  | { type: "auto" }
  | { type: "keep" }
  | { type: "new-ref" }
  | { type: "prefix"; value: string }
  | { type: "suffix"; value: string };

export type StructureMergeOptions = {
  source: number;
  target: number;
  customRef: StructureMergeCustomRefRule;
  // Fixed once for the whole merge (given by the analysis): max(ref) of the
  // target before any dossier is moved. Required to resume consistently.
  refOffset?: number;
};

export type StructureMergeRef = {
  usagerUUID: string;
  oldRef: number;
  newRef: number;
  oldCustomRef: string | null;
  newCustomRef: string;
  searchField: string;
};

export type StructureMergeCounts = Record<
  string,
  { source: number; target: number }
>;

export type StructureMergePreflight = {
  source: { id: number; uuid: string; nom: string };
  target: { id: number; uuid: string; nom: string };
  refOffset: number;
  refCollisions: number[];
  counts: StructureMergeCounts;
  usagersByStatut: Record<string, number>;
  users: { email: string; role: string; nom: string; prenom: string }[];
  customRefCollisions: string[];
  refs: StructureMergeRef[];
};

export type StructureMergeFilesResult = {
  total: number;
  copied: number;
  skipped: number;
};

export type StructureMergeResult = {
  dossiers: number;
  files: StructureMergeFilesResult;
  before: StructureMergeCounts;
  after: StructureMergeCounts;
};
