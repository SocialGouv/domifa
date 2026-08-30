import { join } from "node:path";
import { QueryRunner } from "typeorm";
import { normalizeString } from "@domifa/common";
import { domifaConfig } from "../../../config";
import { appLogger, cleanPath, FileManagerService } from "../../../util";
import {
  StructureMergeCounts,
  StructureMergeCustomRefRule,
  StructureMergeFilesResult,
  StructureMergeOptions,
  StructureMergePreflight,
  StructureMergeRef,
  StructureMergeResult,
} from "../types/structures-merge.types";
import {
  STRUCTURE_MERGE_BULK_TABLES,
  STRUCTURE_MERGE_BULK_TABLES_WITH_REF,
  STRUCTURE_MERGE_COUNTED_TABLES,
  STRUCTURE_MERGE_DOSSIER_TABLES,
  STRUCTURE_MERGE_DOSSIER_TABLES_WITH_REF,
  STRUCTURE_MERGE_USER_TABLES,
} from "../constants/STRUCTURE_MERGE_TABLES.const";

const TAG = "[structures-merge]";
const RULE = "━".repeat(70);

type StructureRow = { id: number; uuid: string; nom: string };

type UsagerRow = {
  uuid: string;
  ref: number;
  customRef: string | null;
  nom: string;
  prenom: string;
  surnom: string | null;
};

type DossierTable =
  | (typeof STRUCTURE_MERGE_DOSSIER_TABLES_WITH_REF)[number]
  | (typeof STRUCTURE_MERGE_DOSSIER_TABLES)[number]
  | "user_usager_security";

const DOSSIER_TABLES: DossierTable[] = [
  ...STRUCTURE_MERGE_DOSSIER_TABLES_WITH_REF,
  ...STRUCTURE_MERGE_DOSSIER_TABLES,
  "user_usager_security",
];

export function computeMergedCustomRef(
  usager: Pick<UsagerRow, "ref" | "customRef">,
  newRef: number,
  rule: StructureMergeCustomRefRule
): string {
  const oldCustomRef = usager.customRef ?? `${usager.ref}`;
  const isDefault = oldCustomRef === `${usager.ref}`;

  switch (rule.type) {
    case "keep":
      return oldCustomRef;
    case "new-ref":
      return `${newRef}`;
    case "prefix":
      return `${rule.value}${oldCustomRef}`;
    case "suffix":
      return `${oldCustomRef}${rule.value}`;
    case "auto":
    default:
      return isDefault ? `${newRef}` : oldCustomRef;
  }
}

export function computeSearchField(
  usager: Pick<UsagerRow, "nom" | "prenom" | "surnom">,
  ref: number,
  customRef: string | null
): string {
  const parts = [
    usager.nom?.trim(),
    usager.prenom?.trim(),
    usager.surnom,
    customRef ?? ref,
  ].filter(Boolean);
  return normalizeString(parts.join(" "));
}

export class StructuresMergeService {
  constructor(
    private readonly fileManagerService: FileManagerService = new FileManagerService()
  ) {}

  public async findStructures(
    queryRunner: QueryRunner,
    sourceId: number,
    targetId: number
  ): Promise<{ source: StructureRow; target: StructureRow } | null> {
    if (sourceId === targetId) {
      return null;
    }
    const rows: StructureRow[] = await queryRunner.query(
      `SELECT "id", "uuid", "nom" FROM "structure" WHERE "id" IN ($1, $2)`,
      [sourceId, targetId]
    );
    const source = rows.find((r) => r.id === sourceId);
    const target = rows.find((r) => r.id === targetId);
    return source && target ? { source, target } : null;
  }

  // The one counting used by the analysis, before the merge and after it
  public async countRows(
    queryRunner: QueryRunner,
    options: Pick<StructureMergeOptions, "source" | "target">
  ): Promise<StructureMergeCounts> {
    const counts: StructureMergeCounts = {};
    for (const table of STRUCTURE_MERGE_COUNTED_TABLES) {
      const rows: { structureId: number; count: string }[] =
        await queryRunner.query(
          `SELECT "structureId", count(*) AS count FROM "${table}" WHERE "structureId" IN ($1, $2) GROUP BY "structureId"`,
          [options.source, options.target]
        );
      const of = (id: number) =>
        Number(rows.find((r) => r.structureId === id)?.count ?? 0);
      counts[table] = {
        source: of(options.source),
        target: of(options.target),
      };
    }
    return counts;
  }

  // Read-only. Counts what is still attached to the source, so it also
  // describes what remains to do when a merge is resumed.
  public async preflight(
    queryRunner: QueryRunner,
    options: StructureMergeOptions
  ): Promise<StructureMergePreflight | null> {
    const structures = await this.findStructures(
      queryRunner,
      options.source,
      options.target
    );
    if (!structures) {
      return null;
    }
    const { source, target } = structures;

    const counts = await this.countRows(queryRunner, options);

    const [{ max }] = await queryRunner.query(
      `SELECT coalesce(max("ref"), 0) AS max FROM "usager" WHERE "structureId" = $1`,
      [target.id]
    );
    const refOffset = options.refOffset ?? Number(max);

    const collisionRows: { ref: number }[] = await queryRunner.query(
      `SELECT b."ref" FROM "usager" b
        WHERE b."structureId" = $1
          AND EXISTS (SELECT 1 FROM "usager" a WHERE a."structureId" = $2 AND a."ref" = b."ref" + $3)
        ORDER BY b."ref"`,
      [source.id, target.id, refOffset]
    );

    const usagers: UsagerRow[] = await queryRunner.query(
      `SELECT "uuid", "ref", "customRef", "nom", "prenom", "surnom" FROM "usager" WHERE "structureId" = $1 ORDER BY "ref"`,
      [source.id]
    );
    const refs = usagers.map((u) => this.buildRef(u, refOffset, options));

    const targetCustomRefs: { customRef: string }[] = await queryRunner.query(
      `SELECT "customRef" FROM "usager" WHERE "structureId" = $1 AND "customRef" IS NOT NULL`,
      [target.id]
    );
    const existing = new Set(targetCustomRefs.map((r) => r.customRef));
    const customRefCollisions = refs
      .filter((r) => existing.has(r.newCustomRef))
      .map((r) => r.newCustomRef);

    const statutRows: { statut: string; count: string }[] =
      await queryRunner.query(
        `SELECT "statut", count(*) AS count FROM "usager" WHERE "structureId" = $1 GROUP BY "statut" ORDER BY "statut"`,
        [source.id]
      );

    const users: StructureMergePreflight["users"] = await queryRunner.query(
      `SELECT "email", "role", "nom", "prenom" FROM "user_structure" WHERE "structureId" = $1 ORDER BY "role", "email"`,
      [source.id]
    );

    return {
      source,
      target,
      refOffset,
      refCollisions: collisionRows.map((r) => r.ref),
      counts,
      usagersByStatut: Object.fromEntries(
        statutRows.map((r) => [r.statut, Number(r.count)])
      ),
      users,
      customRefCollisions,
      refs,
    };
  }

  // Resumable: every step only touches rows still attached to the source, so
  // running it again after an interruption continues where it stopped.
  public async merge(
    queryRunner: QueryRunner,
    options: StructureMergeOptions
  ): Promise<StructureMergeResult> {
    if (typeof options.refOffset !== "number" || options.refOffset < 0) {
      throw new Error(`${TAG} refOffset is required (see analysis output)`);
    }
    const preflight = await this.preflight(queryRunner, options);
    if (!preflight) {
      throw new Error(
        `${TAG} source #${options.source} / target #${options.target}: structures not found or identical`
      );
    }
    this.logPreflight(preflight);
    if (preflight.refCollisions.length > 0) {
      throw new Error(
        `${TAG} refOffset ${
          preflight.refOffset
        } collides with target refs for source refs: ${preflight.refCollisions.join(
          ", "
        )}`
      );
    }

    const { source, target, refs, counts: before } = preflight;
    const files: StructureMergeFilesResult = {
      total: 0,
      copied: 0,
      skipped: 0,
    };

    this.log(RULE);
    this.log(`▶ ÉTAPE 1/4 — ${refs.length} dossiers, un par un`);

    for (const [index, ref] of refs.entries()) {
      const position = `[${index + 1}/${refs.length}]`;
      this.log(RULE);
      this.log(
        `▶ ${position} Dossier ${ref.usagerUUID} — ref ${ref.oldRef} → ${ref.newRef}, customRef "${ref.oldCustomRef}" → "${ref.newCustomRef}"`
      );

      const copy = await this.fileManagerService.copyAllUnderPrefix(
        this.usagerDocumentsPrefix(source, ref.usagerUUID),
        this.usagerDocumentsPrefix(target, ref.usagerUUID)
      );
      files.total += copy.total;
      files.copied += copy.copied;
      files.skipped += copy.skipped;
      this.log(
        `  ├─ S3 usager-documents ${this.pad(copy.copied)} copiés, ${
          copy.skipped
        } déjà présents`
      );

      const expected = await this.countDossier(queryRunner, ref.usagerUUID, [
        source.id,
        target.id,
      ]);
      await this.inTransaction(queryRunner, async () => {
        await this.moveDossier(queryRunner, options, ref);
        const actual = await this.countDossier(queryRunner, ref.usagerUUID, [
          source.id,
          target.id,
        ]);
        this.checkDossier(ref, expected, actual);
      });
      this.log(`  └─ ✔ dossier ${ref.usagerUUID} contrôlé et validé`);
    }

    this.log(RULE);
    this.log(`▶ ÉTAPE 2/4 — annexes de "${source.nom}" (update massif)`);
    await this.inTransaction(queryRunner, async () => {
      for (const table of STRUCTURE_MERGE_BULK_TABLES_WITH_REF) {
        const [, count] = await queryRunner.query(
          `UPDATE "${table}" SET "structureId" = $1, "usagerRef" = "usagerRef" + $2 WHERE "structureId" = $3`,
          [target.id, options.refOffset, source.id]
        );
        this.log(`  ├─ ${this.padTable(table)} ${this.lines(count)}`);
      }
      for (const table of STRUCTURE_MERGE_BULK_TABLES) {
        const [, count] = await queryRunner.query(
          `UPDATE "${table}" SET "structureId" = $1 WHERE "structureId" = $2`,
          [target.id, source.id]
        );
        this.log(`  ├─ ${this.padTable(table)} ${this.lines(count)}`);
      }
    });
    this.log(`  └─ ✔ annexes déplacées`);

    this.log(RULE);
    this.log(`▶ ÉTAPE 3/4 — comptes des agents de "${source.nom}"`);
    await this.inTransaction(queryRunner, async () => {
      for (const table of STRUCTURE_MERGE_USER_TABLES) {
        const [, count] = await queryRunner.query(
          `UPDATE "${table}" SET "structureId" = $1 WHERE "structureId" = $2`,
          [target.id, source.id]
        );
        this.log(`  ├─ ${this.padTable(table)} ${this.lines(count)}`);
      }
    });
    this.log(`  └─ ✔ agents déplacés`);

    this.log(RULE);
    this.log(`▶ ÉTAPE 4/4 — contrôle final (même comptage que l'analyse)`);
    const after = await this.countRows(queryRunner, options);
    this.checkFinal(before, after, options);

    return { dossiers: refs.length, files, before, after };
  }

  private async moveDossier(
    queryRunner: QueryRunner,
    options: StructureMergeOptions,
    ref: StructureMergeRef
  ): Promise<void> {
    const { source, target } = options;
    const { usagerUUID, newRef } = ref;

    const [, moved] = await queryRunner.query(
      `UPDATE "usager"
          SET "structureId" = $1, "ref" = $2, "customRef" = $3, "nom_prenom_surnom_ref" = $4
        WHERE "uuid" = $5 AND "structureId" = $6`,
      [target, newRef, ref.newCustomRef, ref.searchField, usagerUUID, source]
    );
    if (moved !== 1) {
      throw new Error(
        `${TAG} dossier ${usagerUUID} is no longer attached to structure #${source}`
      );
    }
    this.log(`  ├─ ${this.padTable("usager")} ${this.lines(1)}`);

    for (const table of STRUCTURE_MERGE_DOSSIER_TABLES_WITH_REF) {
      const [, count] = await queryRunner.query(
        `UPDATE "${table}" SET "structureId" = $1, "usagerRef" = $2 WHERE "usagerUUID" = $3 AND "structureId" = $4`,
        [target, newRef, usagerUUID, source]
      );
      this.log(`  ├─ ${this.padTable(table)} ${this.lines(count)}`);
    }

    const [, security] = await queryRunner.query(
      `UPDATE "user_usager_security" SET "structureId" = $1
        WHERE "structureId" = $2 AND "userId" IN (SELECT "id" FROM "user_usager" WHERE "usagerUUID" = $3)`,
      [target, source, usagerUUID]
    );
    this.log(
      `  ├─ ${this.padTable("user_usager_security")} ${this.pad(
        security
      )} lignes`
    );

    for (const table of STRUCTURE_MERGE_DOSSIER_TABLES) {
      const [, count] = await queryRunner.query(
        `UPDATE "${table}" SET "structureId" = $1 WHERE "usagerUUID" = $2 AND "structureId" = $3`,
        [target, usagerUUID, source]
      );
      this.log(`  ├─ ${this.padTable(table)} ${this.lines(count)}`);
    }
  }

  private async countDossier(
    queryRunner: QueryRunner,
    usagerUUID: string,
    structureIds: number[]
  ): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const table of DOSSIER_TABLES) {
      const [{ count }] =
        table === "user_usager_security"
          ? await queryRunner.query(
              `SELECT count(*) AS count FROM "user_usager_security"
                WHERE "structureId" = ANY($1) AND "userId" IN (SELECT "id" FROM "user_usager" WHERE "usagerUUID" = $2)`,
              [structureIds, usagerUUID]
            )
          : await queryRunner.query(
              `SELECT count(*) AS count FROM "${table}" WHERE "structureId" = ANY($1) AND "usagerUUID" = $2`,
              [structureIds, usagerUUID]
            );
      counts[table] = Number(count);
    }
    return counts;
  }

  private checkDossier(
    ref: StructureMergeRef,
    expected: Record<string, number>,
    actual: Record<string, number>
  ): void {
    const mismatches = Object.keys(expected).filter(
      (table) => expected[table] !== actual[table]
    );
    if (mismatches.length > 0) {
      throw new Error(
        `${TAG} dossier ${ref.usagerUUID}: row count changed for ${mismatches
          .map((t) => `${t} ${expected[t]} → ${actual[t]}`)
          .join(", ")}`
      );
    }
  }

  private checkFinal(
    before: StructureMergeCounts,
    after: StructureMergeCounts,
    options: StructureMergeOptions
  ): void {
    const errors: string[] = [];
    this.log(
      `  ${this.padTable("table")} ${this.pad("B avant")} ${this.pad(
        "A avant"
      )} ${this.pad("A après")} ${this.pad("attendu")} ${this.pad("B après")}`
    );
    for (const table of Object.keys(before)) {
      const expected = before[table].source + before[table].target;
      const ok = after[table].target === expected && after[table].source === 0;
      if (!ok) {
        errors.push(table);
      }
      this.log(
        `  ${this.padTable(table)} ${this.pad(before[table].source)} ${this.pad(
          before[table].target
        )} ${this.pad(after[table].target)} ${this.pad(expected)} ${this.pad(
          after[table].source
        )} ${ok ? "✔" : "✘"}`
      );
    }
    if (errors.length > 0) {
      throw new Error(
        `${TAG} final check failed on ${errors.join(", ")} (source #${
          options.source
        } → target #${options.target})`
      );
    }
    this.log(RULE);
    this.log(
      `✔ FUSION TERMINÉE — plus rien sur #${options.source}, A = A avant + B avant sur toutes les tables`
    );
  }

  private async inTransaction<T>(
    queryRunner: QueryRunner,
    work: () => Promise<T>
  ): Promise<T> {
    await queryRunner.startTransaction();
    try {
      const result = await work();
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  public logPreflight(preflight: StructureMergePreflight): void {
    const { source, target, refs, counts } = preflight;
    this.log(RULE);
    this.log(
      `▶ ANALYSE — "${source.nom}" (#${source.id}) → "${target.nom}" (#${target.id})`
    );
    this.log(
      `  ${this.padTable("table")} ${this.pad("sur B")} ${this.pad("sur A")}`
    );
    for (const table of Object.keys(counts)) {
      this.log(
        `  ${this.padTable(table)} ${this.pad(counts[table].source)} ${this.pad(
          counts[table].target
        )}`
      );
    }
    this.log(`  usagers de B par statut`, preflight.usagersByStatut);
    this.log(`  agents de B (${preflight.users.length})`, {
      users: preflight.users,
    });
    this.log(
      `  refOffset = ${preflight.refOffset} → valeur à reporter dans la migration de fusion ; ${refs.length} dossiers à déplacer`
    );
    this.log(
      `  collisions de ref sur A avec cet offset : ${preflight.refCollisions.length}`,
      { refCollisions: preflight.refCollisions }
    );
    this.log(
      `  collisions de customRef sur A après règle : ${preflight.customRefCollisions.length}`,
      { customRefCollisions: preflight.customRefCollisions }
    );
    for (const ref of refs) {
      this.log(
        `  dossier ${ref.usagerUUID} : ref ${ref.oldRef} → ${ref.newRef}, customRef "${ref.oldCustomRef}" → "${ref.newCustomRef}"`
      );
    }
  }

  private log(message: string, data?: Record<string, unknown>): void {
    appLogger.warn(`${TAG} ${message}`, data);
  }

  private lines(count: number): string {
    return `${this.pad(count)} ligne${count > 1 ? "s" : ""}`;
  }

  private pad(value: number | string): string {
    return `${value}`.padStart(8);
  }

  private padTable(table: string): string {
    return table.padEnd(24);
  }

  private buildRef(
    usager: UsagerRow,
    offset: number,
    options: StructureMergeOptions
  ): StructureMergeRef {
    const newRef = usager.ref + offset;
    const newCustomRef = computeMergedCustomRef(
      usager,
      newRef,
      options.customRef
    );
    return {
      usagerUUID: usager.uuid,
      oldRef: usager.ref,
      newRef,
      oldCustomRef: usager.customRef,
      newCustomRef,
      searchField: computeSearchField(usager, newRef, newCustomRef),
    };
  }

  private usagerDocumentsPrefix(
    structure: StructureRow,
    usagerUUID: string
  ): string {
    return `${join(
      domifaConfig().upload.bucketRootDir,
      "usager-documents",
      cleanPath(structure.uuid),
      cleanPath(usagerUUID)
    )}/`;
  }
}
