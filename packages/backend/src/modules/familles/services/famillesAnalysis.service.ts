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
  DossierLight,
  StructureFamillesRow,
} from "../types/famillesAnalysis.types";
import {
  bestMatch,
  countCommonChildren,
  isAdultOn,
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
           FROM "usager" WHERE "structureId" = $1`,
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

  // One pass over every dossier of every structure, minimal fields. Holds only
  // "birthDay|nom|prenom" strings for exact matches, used to tell a conjoint
  // that has a dossier in another structure from one that has none at all.
  private async buildGlobalExactIndex(
    queryRunner: QueryRunner
  ): Promise<Set<string>> {
    const rows: { nom: string; prenom: string; dateNaissance: Date }[] =
      await queryRunner.query(
        `SELECT "nom", "prenom", "dateNaissance" FROM "usager"`
      );

    const keys = new Set<string>();
    for (const row of rows) {
      const birthDay = toParisDay(row.dateNaissance);
      if (birthDay) {
        keys.add(`${birthDay}|${normalizeCompareKey(row.nom, row.prenom)}`);
      }
    }
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
      conjoints_autre_structure: sum("conjoints_autre_structure"),
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

// All the counters for one structure. Pure: no database, no clock beyond `now`
// for the adult-child age test.
export function computeStructureFamillesRow(
  structureId: number,
  dossiers: DossierLight[],
  globalExactKeys: Set<string>,
  now: number = Date.now()
): StructureFamillesRow {
  const dossiersByBirthDay = groupByBirthDay(dossiers);
  const row = emptyRow(structureId);
  row.dossiers = dossiers.length;

  // ── Volumes ─────────────────────────────────────────────────────────────
  for (const dossier of dossiers) {
    row.ayants_droit += dossier.ayantsDroits.length;
    let hasSpouse = false;
    for (const ad of dossier.ayantsDroits) {
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

  // ── Conjoints & couples ─────────────────────────────────────────────────
  // pairKey ("uuidA|uuidB", uuids sorted) -> the two dossiers of the couple
  const couplePairs = new Map<string, [DossierLight, DossierLight]>();
  // "declarerUuid->spouseUuid" for every spouse found (score >= SAME_PERSON)
  const declaredSpouseLinks = new Set<string>();

  for (const dossier of dossiers) {
    for (const ad of dossier.ayantsDroits) {
      if (ad.lien !== "CONJOINT") {
        continue;
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
        continue;
      } else if (
        ad.birthDay &&
        globalExactKeys.has(`${ad.birthDay}|${ad.key}`)
      ) {
        row.conjoints_autre_structure++;
        continue;
      } else {
        row.conjoints_non_trouves++;
        continue;
      }

      // spouse found in this structure -> the couple
      const spouse = match.candidate;
      if (!spouse) {
        continue;
      }
      declaredSpouseLinks.add(`${dossier.uuid}->${spouse.uuid}`);
      const pairKey = [dossier.uuid, spouse.uuid].sort().join("|");
      if (!couplePairs.has(pairKey)) {
        couplePairs.set(pairKey, [dossier, spouse]);
      }
    }
  }

  row.couples = couplePairs.size;

  // ── Children, cross-declaration and parents of couples ──────────────────
  for (const [pairKey, [a, b]] of couplePairs) {
    const [uuidA, uuidB] = pairKey.split("|");
    if (
      declaredSpouseLinks.has(`${uuidA}->${uuidB}`) &&
      declaredSpouseLinks.has(`${uuidB}->${uuidA}`)
    ) {
      row.couples_croises++;
    }

    const childrenA = a.ayantsDroits.filter((ad) => ad.lien === "ENFANT");
    const childrenB = b.ayantsDroits.filter((ad) => ad.lien === "ENFANT");
    const common = countCommonChildren(childrenA, childrenB);

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

  // ── Adult children / parents that also have their own dossier here ──────
  for (const dossier of dossiers) {
    for (const ad of dossier.ayantsDroits) {
      if (ad.lien === "ENFANT") {
        if (
          isAdultOn(ad.birthDay, now) &&
          bestMatch(ad.key, ad.birthDay, dossiersByBirthDay, dossier.uuid)
            .score >= FAMILLES_SCORE_IDENTIQUE
        ) {
          row.enfants_majeurs_avec_dossier++;
        }
      } else if (ad.lien === "PARENT") {
        if (
          bestMatch(ad.key, ad.birthDay, dossiersByBirthDay, dossier.uuid)
            .score >= FAMILLES_SCORE_IDENTIQUE
        ) {
          row.parents_avec_dossier++;
        }
      }
    }
  }

  // ── How many people are counted twice ──────────────────────────────────
  row.personnes_comptees_aujourdhui = row.dossiers + row.ayants_droit;
  row.personnes_reelles_estimees =
    row.personnes_comptees_aujourdhui -
    (row.conjoints_identiques + row.conjoints_tres_proches) -
    row.enfants_comptes_deux_fois;
  row.gap_personnes =
    row.personnes_comptees_aujourdhui - row.personnes_reelles_estimees;
  row.gap_pourcentage =
    row.personnes_comptees_aujourdhui === 0
      ? 0
      : Math.round(
          (row.gap_personnes / row.personnes_comptees_aujourdhui) * 100
        );

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

function emptyRow(structureId: number): StructureFamillesRow {
  return {
    structureId,
    dossiers: 0,
    ayants_droit: 0,
    ayants_droit_sans_date_naissance: 0,
    dossiers_avec_conjoint: 0,
    conjoints_identiques: 0,
    conjoints_tres_proches: 0,
    conjoints_douteux: 0,
    conjoints_non_trouves: 0,
    conjoints_autre_structure: 0,
    couples: 0,
    couples_croises: 0,
    couples_memes_enfants: 0,
    couples_enfants_en_partie_communs: 0,
    couples_enfants_differents: 0,
    couples_sans_enfant: 0,
    enfants_comptes_deux_fois: 0,
    couples_avec_parent: 0,
    enfants_majeurs_avec_dossier: 0,
    parents_avec_dossier: 0,
    personnes_comptees_aujourdhui: 0,
    personnes_reelles_estimees: 0,
    gap_personnes: 0,
    gap_pourcentage: 0,
  };
}
