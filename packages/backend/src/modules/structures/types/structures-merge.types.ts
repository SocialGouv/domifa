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

export type StructureMergeS3Object = { key: string; size: number };

export type StructureMergeDocRow = { usagerUUID: string; path: string };

// S3 objects under usager-documents/<structure uuid>/ for one structure
export type StructureMergeFilesInventory = {
  count: number;
  bytes: number;
  // usager_docs rows whose file is not in S3 (already broken, not the merge's doing)
  docsWithoutFile: number;
  // objects under the raw uuid (with dashes): unreachable by the app, not copied
  legacy: number;
};

// Every source object whose usager is in `usagerUUIDs` must exist at the
// target with the same size. Objects of other usagers (deleted dossiers) are
// orphans: never copied, only counted.
export type StructureMergeFilesDiff = {
  checked: number;
  present: number;
  missing: string[];
  orphans: number;
};

export type StructureMergeFilesPreflight = {
  source: StructureMergeFilesInventory;
  target: StructureMergeFilesInventory;
  diff: StructureMergeFilesDiff;
};

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
  files: StructureMergeFilesPreflight;
};

export type StructureMergeFilesResult = {
  total: number;
  copied: number;
  skipped: number;
};

export type StructureMergeResult = {
  dossiers: number;
  files: StructureMergeFilesResult;
  filesCheck: StructureMergeFilesPreflight;
  before: StructureMergeCounts;
  after: StructureMergeCounts;
};
