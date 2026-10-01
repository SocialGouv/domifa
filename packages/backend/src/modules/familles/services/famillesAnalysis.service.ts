import { QueryRunner } from "typeorm";
import { AyantDroiLienParent, UsagerAyantDroit } from "@domifa/common";

import { appLogger, FileManagerService } from "../../../util";
import {
  FAMILLES_ANALYSIS_COLUMNS,
  FAMILLES_ANALYSIS_CSV_PATH,
  FAMILLES_SCORE_DOUTEUX,
  FAMILLES_SCORE_IDENTIQUE,
  FAMILLES_SCORE_SAME_PERSON,
} from "../constants/FAMILLES_ANALYSIS.const";
import {
  AyantDroitLight,
  DossierLight,
  StructureFamillesRow,
} from "../types/famillesAnalysis.types";
import {
  bestMatch,
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

      appLogger.warn(
        `${TAG} structure ${structureId} (${i + 1}/${structureIds.length}) — ` +
          `${row.dossiers} dossiers, ${row.ayants_droit} dependants, ` +
          `${row.couples} couples, gap ${row.gap_personnes} (${row.gap_pourcentage}%)`
      );
    }

    const csv = toCsv(rows);
    await this.uploadCsv(csv);
    this.logSummary(rows, csv, Date.now() - startedAt);

    return rows;
  }

  // One pass over every dossier of every structure, minimal fields, paginated by
  // uuid so a national-scale table is never buffered in one go. Holds only
  // "birthDay|nom|prenom" strings for exact matches, used to tell a conjoint
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

    appLogger.warn(`${TAG} done in ${Math.round(durationMs / 1000)}s`, {
      structures: rows.length,
      dossiers: sum("dossiers"),
      ayants_droit: sum("ayants_droit"),
      conjoints_identiques: sum("conjoints_identiques"),
      conjoints_tres_proches: sum("conjoints_tres_proches"),
      conjoints_douteux: sum("conjoints_douteux"),
      conjoints_non_trouves: sum("conjoints_non_trouves"),
      conjoints_autre_structure: sum("conjoints_autre_structure"),
      conjoints_sans_date_naissance: sum("conjoints_sans_date_naissance"),
      couples: sum("couples"),
      couples_croises: sum("couples_croises"),
      enfants_comptes_deux_fois: sum("enfants_comptes_deux_fois"),
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

// Node id of the `adIndex`-th ayant droit of a dossier, for PersonIdentities.
function adNodeId(dossier: DossierLight, adIndex: number): string {
  return `${dossier.uuid}#${adIndex}`;
}

// Registers a dossier and its ayants droit as identity nodes and updates the
// volume counters (ayants_droit, ayants_droit_sans_date_naissance,
// dossiers_avec_conjoint) for that one dossier.
function registerDossierNodes(
  row: StructureFamillesRow,
  dossier: DossierLight,
  personNodes: string[]
): void {
  personNodes.push(dossier.uuid);
  row.ayants_droit += dossier.ayantsDroits.length;
  let hasSpouse = false;
  for (const [adIndex, ad] of dossier.ayantsDroits.entries()) {
    personNodes.push(adNodeId(dossier, adIndex));
    if (!ad.birthDay) {
      row.ayants_droit_sans_date_naissance++;
    }
    if (ad.lien === "CONJOINT") {
      hasSpouse = true;
    }
  }
  if (hasSpouse) {
    row.dossiers_avec_conjoint++;
  }
}

// One declared conjoint: buckets it (identical / very close / doubtful /
// elsewhere / not found) and, if found in this structure, merges the identity
// and records the couple.
function matchConjointEntry(
  row: StructureFamillesRow,
  dossier: DossierLight,
  adIndex: number,
  ad: AyantDroitLight,
  dossiersByBirthDay: Map<string, DossierLight[]>,
  globalExactKeys: Set<string>,
  identities: PersonIdentities,
  couplePairs: Map<string, [DossierLight, DossierLight]>,
  declaredSpouseLinks: Set<string>
): void {
  if (!ad.birthDay) {
    // unmeasurable, not "searched and not found": kept out of
    // conjoints_non_trouves so it doesn't bias the couple count down
    row.conjoints_sans_date_naissance++;
    return;
  }
  const match = bestMatch(
    ad.key,
    ad.birthDay,
    dossiersByBirthDay,
    dossier.uuid
  );

  if (match.score >= FAMILLES_SCORE_IDENTIQUE) {
    row.conjoints_identiques++;
  } else if (match.score >= FAMILLES_SCORE_SAME_PERSON) {
    row.conjoints_tres_proches++;
  } else if (match.score >= FAMILLES_SCORE_DOUTEUX) {
    row.conjoints_douteux++;
    return;
  } else if (globalExactKeys.has(`${ad.birthDay}|${ad.key}`)) {
    row.conjoints_autre_structure++;
    return;
  } else {
    row.conjoints_non_trouves++;
    return;
  }

  // spouse found in this structure -> the couple, and the same person
  const spouse = match.candidate;
  if (!spouse) {
    return;
  }
  identities.union(adNodeId(dossier, adIndex), spouse.uuid);
  declaredSpouseLinks.add(`${dossier.uuid}->${spouse.uuid}`);
  const pairKey = [dossier.uuid, spouse.uuid]
    .sort((a, b) => a.localeCompare(b))
    .join("|");
  if (!couplePairs.has(pairKey)) {
    couplePairs.set(pairKey, [dossier, spouse]);
  }
}

// Every declared conjoint of every dossier: fills the conjoints_* buckets and
// returns the couples found (pairKey -> the two dossiers) plus who declared
// whom, for matchCoupleChildren below.
function matchConjoints(
  row: StructureFamillesRow,
  dossiers: DossierLight[],
  dossiersByBirthDay: Map<string, DossierLight[]>,
  globalExactKeys: Set<string>,
  identities: PersonIdentities
): {
  couplePairs: Map<string, [DossierLight, DossierLight]>;
  declaredSpouseLinks: Set<string>;
} {
  // pairKey ("uuidA|uuidB", uuids sorted) -> the two dossiers of the couple
  const couplePairs = new Map<string, [DossierLight, DossierLight]>();
  // "declarerUuid->spouseUuid" for every spouse found (score >= SAME_PERSON)
  const declaredSpouseLinks = new Set<string>();

  for (const dossier of dossiers) {
    for (const [adIndex, ad] of dossier.ayantsDroits.entries()) {
      if (ad.lien !== "CONJOINT") {
        continue;
      }
      matchConjointEntry(
        row,
        dossier,
        adIndex,
        ad,
        dossiersByBirthDay,
        globalExactKeys,
        identities,
        couplePairs,
        declaredSpouseLinks
      );
    }
  }

  row.couples = couplePairs.size;
  return { couplePairs, declaredSpouseLinks };
}

// Children, cross-declaration and parents of one couple.
function matchCoupleChildren(
  row: StructureFamillesRow,
  pairKey: string,
  a: DossierLight,
  b: DossierLight,
  declaredSpouseLinks: Set<string>,
  identities: PersonIdentities
): void {
  const [uuidA, uuidB] = pairKey.split("|");
  if (
    declaredSpouseLinks.has(`${uuidA}->${uuidB}`) &&
    declaredSpouseLinks.has(`${uuidB}->${uuidA}`)
  ) {
    row.couples_croises++;
  }

  const childrenA = [...a.ayantsDroits.entries()].filter(
    ([, ad]) => ad.lien === "ENFANT"
  );
  const childrenB = [...b.ayantsDroits.entries()].filter(
    ([, ad]) => ad.lien === "ENFANT"
  );
  const matches = matchCommonChildren(
    childrenA.map(([, ad]) => ad),
    childrenB.map(([, ad]) => ad)
  );
  for (const { indexA, indexB } of matches) {
    // the same child declared by both parents: one real person, not two
    identities.union(
      adNodeId(a, childrenA[indexA][0]),
      adNodeId(b, childrenB[indexB][0])
    );
  }
  const common = matches.length;

  if (childrenA.length === 0 && childrenB.length === 0) {
    row.couples_sans_enfant++;
  } else if (
    common > 0 &&
    common === childrenA.length &&
    common === childrenB.length
  ) {
    row.couples_memes_enfants++;
  } else if (common > 0) {
    row.couples_enfants_en_partie_communs++;
  } else {
    // children on at least one side, none in common (includes the case
    // where only one dossier declares children) — see plan note
    row.couples_enfants_differents++;
  }
  row.enfants_comptes_deux_fois += common;

  if (
    a.ayantsDroits.some((ad) => ad.lien === "PARENT") ||
    b.ayantsDroits.some((ad) => ad.lien === "PARENT")
  ) {
    row.couples_avec_parent++;
  }
}

// An adult child (or a parent) that turns out to have their own dossier here
// is the same person as that dossier — merge the identity.
function matchOwnDossier(
  dossier: DossierLight,
  adIndex: number,
  ad: AyantDroitLight,
  dossiersByBirthDay: Map<string, DossierLight[]>,
  identities: PersonIdentities,
  onFound: () => void
): void {
  const match = bestMatch(
    ad.key,
    ad.birthDay,
    dossiersByBirthDay,
    dossier.uuid
  );
  if (match.score >= FAMILLES_SCORE_IDENTIQUE && match.candidate) {
    onFound();
    identities.union(adNodeId(dossier, adIndex), match.candidate.uuid);
  }
}

// Adult children and parents declared on one dossier that also have their own
// dossier in the structure.
function matchAdultDependants(
  row: StructureFamillesRow,
  dossier: DossierLight,
  dossiersByBirthDay: Map<string, DossierLight[]>,
  identities: PersonIdentities,
  now: number
): void {
  for (const [adIndex, ad] of dossier.ayantsDroits.entries()) {
    if (ad.lien === "ENFANT" && isAdultOn(ad.birthDay, now)) {
      matchOwnDossier(
        dossier,
        adIndex,
        ad,
        dossiersByBirthDay,
        identities,
        () => row.enfants_majeurs_avec_dossier++
      );
    } else if (ad.lien === "PARENT") {
      matchOwnDossier(
        dossier,
        adIndex,
        ad,
        dossiersByBirthDay,
        identities,
        () => row.parents_avec_dossier++
      );
    }
  }
}

// personnes_reelles_estimees is the number of distinct identities left after
// every match above (spouse, common child, adult child/parent with their own
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
  const dossiersByBirthDay = groupByBirthDay(dossiers);
  const row = new StructureFamillesRow(structureId);
  row.dossiers = dossiers.length;

  // One node per dossier and per ayant droit occurrence; matched ones are
  // merged transitively by the steps below.
  const identities = new PersonIdentities();
  const personNodes: string[] = [];

  for (const dossier of dossiers) {
    registerDossierNodes(row, dossier, personNodes);
  }

  const { couplePairs, declaredSpouseLinks } = matchConjoints(
    row,
    dossiers,
    dossiersByBirthDay,
    globalExactKeys,
    identities
  );

  for (const [pairKey, [a, b]] of couplePairs) {
    matchCoupleChildren(row, pairKey, a, b, declaredSpouseLinks, identities);
  }

  for (const dossier of dossiers) {
    matchAdultDependants(row, dossier, dossiersByBirthDay, identities, now);
  }

  computePopulationGap(row, identities, personNodes);

  return row;
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
