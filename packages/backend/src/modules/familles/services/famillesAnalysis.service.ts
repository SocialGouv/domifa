import { QueryRunner } from "typeorm";
import { AyantDroiLienParent, UsagerAyantDroit } from "@domifa/common";

import { appLogger, FileManagerService } from "../../../util";
import {
  CONJOINT_COUNTERS,
  ENFANT_MAJEUR_COUNTERS,
  FAMILLES_ANALYSIS_COLUMNS,
  FAMILLES_ANALYSIS_CSV_PATH,
  FAMILLES_COHORTS,
} from "../constants/FAMILLES_ANALYSIS.const";
import {
  AyantDroitLight,
  CohortOutcome,
  DossierLight,
  RowCounter,
  StructureFamillesRow,
} from "../types/famillesAnalysis.types";
import {
  bestMatch,
  bucketFromScore,
  isAdultOn,
  matchCommonChildren,
  normalizeCompareKey,
  toParisDay,
} from "./famillesMatching";

const TAG = "[familles-analysis]";

type RawAyantDroit = Partial<UsagerAyantDroit> & {
  // very old rows stored the link under `lienParente`
  lienParente?: AyantDroiLienParent;
};

export type UsagerRow = {
  uuid: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  ayantsDroits: RawAyantDroit[] | null;
};

// Counter of the "ayants droit" cohort each link falls into.
const LIEN_COUNTERS: Record<AyantDroiLienParent, RowCounter> = {
  CONJOINT: "ayants_droit_conjoints",
  ENFANT: "ayants_droit_enfants",
  PARENT: "ayants_droit_parents",
  AUTRE: "ayants_droit_autres",
};

type ChildAge = "unknown" | "minor" | "adult";

const CHILD_AGE_COUNTERS: Record<ChildAge, RowCounter> = {
  unknown: "enfants_sans_date_naissance",
  minor: "enfants_mineurs",
  adult: "enfants_majeurs",
};

// Read-only analysis of how the dossiers and dependants of a same household
// overlap. Loads production data structure by structure, compares names / birth
// dates in memory, and writes only per-structure counters to a CSV. No database
// write, no personal data leaves — see the "familles" spec.
export class FamillesAnalysisService {
  constructor(
    private readonly fileManagerService: FileManagerService = new FileManagerService()
  ) {}

  public async run(queryRunner: QueryRunner): Promise<StructureFamillesRow[]> {
    const startedAt = Date.now();

    const globalExactKeys = await this.buildGlobalExactIndex(queryRunner);
    appLogger.warn(
      `${TAG} national exact-match index: ${globalExactKeys.size} keys`
    );

    const structureIds: number[] = (
      await queryRunner.query(`SELECT "id" FROM "structure" ORDER BY "id"`)
    ).map((r: { id: number }) => r.id);
    appLogger.warn(`${TAG} ${structureIds.length} structures to process`);

    const rows: StructureFamillesRow[] = [];
    for (let i = 0; i < structureIds.length; i++) {
      const structureId = structureIds[i];
      const usagers: UsagerRow[] = await queryRunner.query(
        `SELECT "uuid", "nom", "prenom", "dateNaissance", "ayantsDroits"
           FROM "usager" WHERE "structureId" = $1 ORDER BY "uuid"`,
        [structureId]
      );

      const row = computeStructureFamillesRow(
        structureId,
        usagers.map(toDossierLight),
        globalExactKeys
      );
      rows.push(row);
      this.logStructure(row, i, structureIds.length);
    }

    // logged before the upload: if S3 fails, the results are still in the logs
    const csv = toCsv(rows);
    this.logSummary(rows, csv, Date.now() - startedAt);
    await this.uploadCsv(csv);

    return rows;
  }

  // One pass over every dossier of every structure, minimal fields, paginated by
  // uuid so a national-scale table is never buffered in one go. Holds only
  // "birthDay|nom|prenom" strings for exact matches, used to tell a person
  // that has a dossier in another structure from one that has none at all.
  private async buildGlobalExactIndex(
    queryRunner: QueryRunner
  ): Promise<Set<string>> {
    const pageSize = 5000;
    const keys = new Set<string>();
    let lastUuid: string | null = null;
    let scanned = 0;

    for (;;) {
      const page: {
        uuid: string;
        nom: string;
        prenom: string;
        dateNaissance: Date;
      }[] = await queryRunner.query(
        lastUuid
          ? `SELECT "uuid", "nom", "prenom", "dateNaissance" FROM "usager"
                 WHERE "uuid" > $1 ORDER BY "uuid" LIMIT $2`
          : `SELECT "uuid", "nom", "prenom", "dateNaissance" FROM "usager"
                 ORDER BY "uuid" LIMIT $1`,
        lastUuid ? [lastUuid, pageSize] : [pageSize]
      );
      if (page.length === 0) {
        break;
      }

      for (const row of page) {
        const birthDay = toParisDay(row.dateNaissance);
        if (birthDay) {
          keys.add(`${birthDay}|${normalizeCompareKey(row.nom, row.prenom)}`);
        }
      }

      scanned += page.length;
      lastUuid = page[page.length - 1].uuid;
      if (page.length < pageSize) {
        break;
      }
    }

    appLogger.warn(
      `${TAG} national exact-match index: ${scanned} usagers scanned`
    );
    return keys;
  }

  private logStructure(
    row: StructureFamillesRow,
    index: number,
    total: number
  ): void {
    appLogger.warn(
      `${TAG} structure ${row.structureId} (${index + 1}/${total}) — ` +
        `${row.dossiers} dossiers, ${row.ayants_droit} dependants, ` +
        `${row.couples} couples, gap ${row.gap_personnes} (${row.gap_pourcentage}%)`
    );
    const broken = cohortTotalsErrors(row);
    if (broken.length > 0) {
      appLogger.error(
        `${TAG} structure ${
          row.structureId
        }: cohorts do not add up: ${broken.join("; ")}`,
        { sentry: true }
      );
    }
  }

  private async uploadCsv(csv: string): Promise<void> {
    await this.fileManagerService.uploadFile(
      FAMILLES_ANALYSIS_CSV_PATH,
      Buffer.from(csv, "utf-8")
    );
    appLogger.warn(`${TAG} CSV uploaded to S3: ${FAMILLES_ANALYSIS_CSV_PATH}`);
  }

  private logSummary(
    rows: StructureFamillesRow[],
    csv: string,
    durationMs: number
  ): void {
    const sum = (key: keyof StructureFamillesRow) =>
      rows.reduce((acc, r) => acc + r[key], 0);

    appLogger.warn(`${TAG} computed in ${Math.round(durationMs / 1000)}s`, {
      structures: rows.length,
      dossiers: sum("dossiers"),
      ayants_droit: sum("ayants_droit"),
      ayants_droit_conjoints: sum("ayants_droit_conjoints"),
      ayants_droit_enfants: sum("ayants_droit_enfants"),
      ayants_droit_parents: sum("ayants_droit_parents"),
      ayants_droit_autres: sum("ayants_droit_autres"),
      conjoints_identiques: sum("conjoints_identiques"),
      conjoints_tres_proches: sum("conjoints_tres_proches"),
      conjoints_douteux: sum("conjoints_douteux"),
      conjoints_autre_structure: sum("conjoints_autre_structure"),
      conjoints_non_trouves: sum("conjoints_non_trouves"),
      conjoints_sans_date_naissance: sum("conjoints_sans_date_naissance"),
      enfants_majeurs: sum("enfants_majeurs"),
      couples: sum("couples"),
      enfants_presents_deux_fois: sum("enfants_presents_deux_fois"),
      personnes_comptees_aujourdhui: sum("personnes_comptees_aujourdhui"),
      gap_personnes: sum("gap_personnes"),
    });
    // Full CSV in the logs as a fallback if pulling it from prod S3 is awkward.
    appLogger.warn(`${TAG} full CSV:\n${csv}`);
  }
}

// Raw `usager` row (birth date as timestamptz, ayants droits as jsonb) reduced
// to what the comparison needs.
export function toDossierLight(usager: UsagerRow): DossierLight {
  return {
    uuid: usager.uuid,
    birthDay: toParisDay(usager.dateNaissance),
    key: normalizeCompareKey(usager.nom, usager.prenom),
    ayantsDroits: (usager.ayantsDroits ?? []).map((ad) => ({
      nom: ad.nom ?? "",
      prenom: ad.prenom ?? "",
      lien: ad.lien ?? ad.lienParente ?? "AUTRE",
      birthDay: toParisDay(ad.dateNaissance as Date | string | null),
      key: normalizeCompareKey(ad.nom, ad.prenom),
    })),
  };
}

// Minimal union-find over string ids. Used to merge every dossier / ayant
// droit occurrence that gets matched into the same real-person identity, so a
// person matched through more than one route (e.g. a shared child who also
// has their own dossier) is only ever counted once — see
// personnes_reelles_estimees below. Kept local: it's an implementation detail
// of that one counter, not a reusable matching primitive.
class PersonIdentities {
  private readonly parent = new Map<string, string>();

  private find(id: string): string {
    const current = this.parent.get(id) ?? id;
    if (current === id) {
      return id;
    }
    const root = this.find(current);
    this.parent.set(id, root);
    return root;
  }

  union(a: string, b: string): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) {
      this.parent.set(rootA, rootB);
    }
  }

  // Number of distinct identities among the given ids (one never merged
  // counts as its own group of one).
  countGroups(ids: string[]): number {
    return new Set(ids.map((id) => this.find(id))).size;
  }
}

// What the per-structure steps share.
interface StructureContext {
  dossiersByBirthDay: Map<string, DossierLight[]>;
  globalExactKeys: Set<string>;
  identities: PersonIdentities;
  now: number;
}

// Couples found while going through the conjoints.
interface Couples {
  // pairKey ("uuidA|uuidB", uuids sorted) -> the two dossiers of the couple
  pairs: Map<string, [DossierLight, DossierLight]>;
  // "declarerUuid->spouseUuid" for every spouse found
  declaredLinks: Set<string>;
}

// Node id of the `adIndex`-th ayant droit of a dossier, for PersonIdentities.
function adNodeId(dossier: DossierLight, adIndex: number): string {
  return `${dossier.uuid}#${adIndex}`;
}

const isChild = (ad: AyantDroitLight): boolean => ad.lien === "ENFANT";

function childAge(ad: AyantDroitLight, now: number): ChildAge {
  if (!ad.birthDay) {
    return "unknown";
  }
  return isAdultOn(ad.birthDay, now) ? "adult" : "minor";
}

// Counts one ayant droit in its cohorts: by link, and for a child by age.
function countAyantDroit(
  row: StructureFamillesRow,
  ad: AyantDroitLight,
  now: number
): void {
  row.ayants_droit++;
  row[LIEN_COUNTERS[ad.lien] ?? "ayants_droit_autres"]++;
  if (isChild(ad)) {
    row[CHILD_AGE_COUNTERS[childAge(ad, now)]]++;
  }
}

// Registers a dossier and its ayants droit as identity nodes and counts them.
function registerDossier(
  row: StructureFamillesRow,
  dossier: DossierLight,
  personNodes: string[],
  now: number
): void {
  personNodes.push(dossier.uuid);
  for (const [adIndex, ad] of dossier.ayantsDroits.entries()) {
    personNodes.push(adNodeId(dossier, adIndex));
    countAyantDroit(row, ad, now);
  }
  if (dossier.ayantsDroits.some((ad) => ad.lien === "CONJOINT")) {
    row.dossiers_avec_conjoint++;
  }
}

interface Lookup {
  outcome: CohortOutcome;
  dossier: DossierLight | null;
}

// Looks a declared person up among the dossiers of the structure (never the
// one that declares them): same birth day, then the closest name. Nothing close
// enough here but an identical person elsewhere -> "elsewhere".
function lookUpAmongDossiers(
  ctx: StructureContext,
  declaring: DossierLight,
  ad: AyantDroitLight,
  birthDay: string
): Lookup {
  const match = bestMatch(
    ad.key,
    birthDay,
    ctx.dossiersByBirthDay,
    declaring.uuid
  );
  const bucket = bucketFromScore(match.score);
  if (bucket !== "not_found") {
    return { outcome: bucket, dossier: match.candidate };
  }
  const elsewhere = ctx.globalExactKeys.has(`${birthDay}|${ad.key}`);
  return { outcome: elsewhere ? "elsewhere" : "not_found", dossier: null };
}

// The dossier a person was found in, when the match is good enough to be the
// same person (identical or very close).
function sameDossier(lookup: Lookup): DossierLight | null {
  const found =
    lookup.outcome === "identical" || lookup.outcome === "very_close";
  return found ? lookup.dossier : null;
}

function recordCouple(
  ctx: StructureContext,
  couples: Couples,
  dossier: DossierLight,
  adIndex: number,
  spouse: DossierLight
): void {
  ctx.identities.union(adNodeId(dossier, adIndex), spouse.uuid);
  couples.declaredLinks.add(`${dossier.uuid}->${spouse.uuid}`);
  const pairKey = [dossier.uuid, spouse.uuid]
    .sort((a, b) => a.localeCompare(b))
    .join("|");
  if (!couples.pairs.has(pairKey)) {
    couples.pairs.set(pairKey, [dossier, spouse]);
  }
}

// One declared conjoint: counted in its bucket and, when found in this
// structure, merged with that dossier and recorded as a couple.
function processConjoint(
  row: StructureFamillesRow,
  ctx: StructureContext,
  couples: Couples,
  dossier: DossierLight,
  adIndex: number,
  ad: AyantDroitLight
): void {
  if (!ad.birthDay) {
    row.conjoints_sans_date_naissance++;
    return;
  }
  const lookup = lookUpAmongDossiers(ctx, dossier, ad, ad.birthDay);
  row[CONJOINT_COUNTERS[lookup.outcome]]++;
  const spouse = sameDossier(lookup);
  if (spouse) {
    recordCouple(ctx, couples, dossier, adIndex, spouse);
  }
}

// One declared adult child: counted in its bucket and, when it is the same
// person as a dossier of the structure, merged with it.
function processAdultChild(
  row: StructureFamillesRow,
  ctx: StructureContext,
  dossier: DossierLight,
  adIndex: number,
  ad: AyantDroitLight
): void {
  if (!ad.birthDay || childAge(ad, ctx.now) !== "adult") {
    return;
  }
  const lookup = lookUpAmongDossiers(ctx, dossier, ad, ad.birthDay);
  row[ENFANT_MAJEUR_COUNTERS[lookup.outcome]]++;
  const found = sameDossier(lookup);
  if (found) {
    ctx.identities.union(adNodeId(dossier, adIndex), found.uuid);
  }
}

// A declared parent that has an identical dossier in the structure.
function processParent(
  row: StructureFamillesRow,
  ctx: StructureContext,
  dossier: DossierLight,
  adIndex: number,
  ad: AyantDroitLight
): void {
  if (!ad.birthDay) {
    return;
  }
  const lookup = lookUpAmongDossiers(ctx, dossier, ad, ad.birthDay);
  if (lookup.outcome === "identical" && lookup.dossier) {
    row.parents_avec_dossier++;
    ctx.identities.union(adNodeId(dossier, adIndex), lookup.dossier.uuid);
  }
}

function processAyantsDroits(
  row: StructureFamillesRow,
  ctx: StructureContext,
  couples: Couples,
  dossier: DossierLight
): void {
  for (const [adIndex, ad] of dossier.ayantsDroits.entries()) {
    switch (ad.lien) {
      case "CONJOINT":
        processConjoint(row, ctx, couples, dossier, adIndex, ad);
        break;
      case "ENFANT":
        processAdultChild(row, ctx, dossier, adIndex, ad);
        break;
      case "PARENT":
        processParent(row, ctx, dossier, adIndex, ad);
        break;
      default:
        break;
    }
  }
}

// How the children of a couple compare, given how many each dossier declares
// and how many are common.
function countCoupleChildren(
  row: StructureFamillesRow,
  declaredA: number,
  declaredB: number,
  common: number
): void {
  if (declaredA === 0 && declaredB === 0) {
    row.couples_sans_enfant++;
  } else if (common > 0 && common === declaredA && common === declaredB) {
    row.couples_memes_enfants++;
  } else if (common > 0) {
    row.couples_enfants_en_partie_communs++;
  } else {
    // children on at least one side, none in common (includes the case
    // where only one dossier declares children) — see plan note
    row.couples_enfants_differents++;
  }
  row.enfants_comptes_deux_fois += common;
}

// Cross-declaration, children and parents of one couple.
function processCouple(
  row: StructureFamillesRow,
  couples: Couples,
  pairKey: string,
  a: DossierLight,
  b: DossierLight
): void {
  const [uuidA, uuidB] = pairKey.split("|");
  if (
    couples.declaredLinks.has(`${uuidA}->${uuidB}`) &&
    couples.declaredLinks.has(`${uuidB}->${uuidA}`)
  ) {
    row.couples_croises++;
  }

  const childrenA = a.ayantsDroits.filter(isChild);
  const childrenB = b.ayantsDroits.filter(isChild);
  const common = matchCommonChildren(childrenA, childrenB).length;
  countCoupleChildren(row, childrenA.length, childrenB.length, common);

  if (
    a.ayantsDroits.some((ad) => ad.lien === "PARENT") ||
    b.ayantsDroits.some((ad) => ad.lien === "PARENT")
  ) {
    row.couples_avec_parent++;
  }
}

// Every pair of items of a list, each pair once.
function* pairsOf<T>(items: T[]): Generator<[T, T]> {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      yield [items[i], items[j]];
    }
  }
}

// Dossiers that declare at least one child born on each day. Two dossiers can
// only share a child if they share one of these days.
function dossiersByChildBirthDay(
  dossiers: DossierLight[]
): Map<string, DossierLight[]> {
  const byDay = new Map<string, DossierLight[]>();
  for (const dossier of dossiers) {
    const days = new Set(
      dossier.ayantsDroits.filter(isChild).map((ad) => ad.birthDay)
    );
    for (const day of days) {
      if (day) {
        const list = byDay.get(day) ?? [];
        list.push(dossier);
        byDay.set(day, list);
      }
    }
  }
  return byDay;
}

// Children that two dossiers both declare, as pairs of ayant droit node ids.
// Same rule as the common children of a couple (matchCommonChildren).
function childLinksBetween(
  a: DossierLight,
  b: DossierLight
): [string, string][] {
  const entriesA = [...a.ayantsDroits.entries()].filter(([, ad]) =>
    isChild(ad)
  );
  const entriesB = [...b.ayantsDroits.entries()].filter(([, ad]) =>
    isChild(ad)
  );
  const matches = matchCommonChildren(
    entriesA.map(([, ad]) => ad),
    entriesB.map(([, ad]) => ad)
  );
  return matches.map(({ indexA, indexB }) => [
    adNodeId(a, entriesA[indexA][0]),
    adNodeId(b, entriesB[indexB][0]),
  ]);
}

// Children declared on more than one dossier of the structure, whether or not
// the dossiers form a couple. Only dossiers sharing a child's birth day are
// ever compared, so a big structure never costs a full dossier x dossier pass.
function sharedChildLinks(dossiers: DossierLight[]): [string, string][] {
  const links: [string, string][] = [];
  const compared = new Set<string>();
  for (const group of dossiersByChildBirthDay(dossiers).values()) {
    for (const [a, b] of pairsOf(group)) {
      const pair = `${a.uuid}|${b.uuid}`;
      if (!compared.has(pair)) {
        compared.add(pair);
        links.push(...childLinksBetween(a, b));
      }
    }
  }
  return links;
}

// Counts the distinct children declared on several dossiers and merges their
// occurrences into one identity each.
function mergeSharedChildren(
  row: StructureFamillesRow,
  ctx: StructureContext,
  dossiers: DossierLight[]
): void {
  const links = sharedChildLinks(dossiers);
  const sharedChildren = new PersonIdentities();
  for (const [x, y] of links) {
    ctx.identities.union(x, y);
    sharedChildren.union(x, y);
  }
  // every linked occurrence has at least one partner: each group is a child
  // declared on two dossiers or more
  row.enfants_presents_deux_fois = sharedChildren.countGroups(links.flat());
}

// personnes_reelles_estimees is the number of distinct identities left after
// every match above (spouse, shared child, adult child/parent with their own
// dossier) has been merged, transitively — so a person matched through more
// than one route is never subtracted more than once.
function computePopulationGap(
  row: StructureFamillesRow,
  identities: PersonIdentities,
  personNodes: string[]
): void {
  row.personnes_comptees_aujourdhui = row.dossiers + row.ayants_droit;
  row.personnes_reelles_estimees = identities.countGroups(personNodes);
  row.gap_personnes =
    row.personnes_comptees_aujourdhui - row.personnes_reelles_estimees;
  row.gap_pourcentage =
    row.personnes_comptees_aujourdhui === 0
      ? 0
      : Math.round(
          (row.gap_personnes / row.personnes_comptees_aujourdhui) * 100
        );
}

// All the counters for one structure. Pure: no database, no clock beyond `now`
// for the adult-child age test.
export function computeStructureFamillesRow(
  structureId: number,
  dossiers: DossierLight[],
  globalExactKeys: Set<string>,
  now: number = Date.now()
): StructureFamillesRow {
  const row = new StructureFamillesRow(structureId);
  row.dossiers = dossiers.length;

  // One node per dossier and per ayant droit occurrence; matched ones are
  // merged transitively by the steps below.
  const ctx: StructureContext = {
    dossiersByBirthDay: groupByBirthDay(dossiers),
    globalExactKeys,
    identities: new PersonIdentities(),
    now,
  };
  const personNodes: string[] = [];
  const couples: Couples = { pairs: new Map(), declaredLinks: new Set() };

  for (const dossier of dossiers) {
    registerDossier(row, dossier, personNodes, now);
  }
  for (const dossier of dossiers) {
    processAyantsDroits(row, ctx, couples, dossier);
  }

  row.couples = couples.pairs.size;
  for (const [pairKey, [a, b]] of couples.pairs) {
    processCouple(row, couples, pairKey, a, b);
  }

  mergeSharedChildren(row, ctx, dossiers);
  computePopulationGap(row, ctx.identities, personNodes);

  return row;
}

// The cohorts whose sub-groups do not add up exactly to their base (none, when
// every declared person was counted once and only once).
export function cohortTotalsErrors(row: StructureFamillesRow): string[] {
  return FAMILLES_COHORTS.flatMap(({ base, parts }) => {
    const sum = parts.reduce((acc, part) => acc + row[part], 0);
    return sum === row[base]
      ? []
      : [`${base}=${row[base]} but ${parts.join("+")}=${sum}`];
  });
}

export function toCsv(rows: StructureFamillesRow[]): string {
  const header = FAMILLES_ANALYSIS_COLUMNS.join(",");
  const body = rows.map((row) =>
    FAMILLES_ANALYSIS_COLUMNS.map((column) => row[column]).join(",")
  );
  return [header, ...body, ""].join("\n");
}

function groupByBirthDay(
  dossiers: DossierLight[]
): Map<string, DossierLight[]> {
  const byDay = new Map<string, DossierLight[]>();
  for (const dossier of dossiers) {
    if (!dossier.birthDay) {
      continue;
    }
    const list = byDay.get(dossier.birthDay) ?? [];
    list.push(dossier);
    byDay.set(dossier.birthDay, list);
  }
  return byDay;
}
