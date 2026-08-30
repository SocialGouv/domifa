import { QueryRunner } from "typeorm";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import {
  computeMergedCustomRef,
  computeSearchField,
  StructuresMergeService,
} from "./structuresMerge.service";
import { FileManagerService } from "../../../util";
import { myDataSource } from "../../../database";
import {
  StructureMergeCounts,
  StructureMergeOptions,
  StructureMergePreflight,
} from "../types/structures-merge.types";
import {
  STRUCTURE_MERGE_COUNTED_TABLES,
  STRUCTURE_MERGE_DOSSIER_TABLES_WITH_REF,
} from "../constants/STRUCTURE_MERGE_TABLES.const";

describe("computeMergedCustomRef", () => {
  const custom = { ref: 3, customRef: "DOSSIER-3" };
  const byDefault = { ref: 3, customRef: "3" };

  it("auto keeps a customised ref and renumbers a default one", () => {
    expect(computeMergedCustomRef(custom, 103, { type: "auto" })).toBe(
      "DOSSIER-3"
    );
    expect(computeMergedCustomRef(byDefault, 103, { type: "auto" })).toBe(
      "103"
    );
    expect(
      computeMergedCustomRef({ ref: 3, customRef: null }, 103, { type: "auto" })
    ).toBe("103");
  });

  it("applies keep / new-ref / prefix / suffix", () => {
    expect(computeMergedCustomRef(custom, 103, { type: "keep" })).toBe(
      "DOSSIER-3"
    );
    expect(computeMergedCustomRef(custom, 103, { type: "new-ref" })).toBe(
      "103"
    );
    expect(
      computeMergedCustomRef(byDefault, 103, { type: "prefix", value: "B-" })
    ).toBe("B-3");
    expect(
      computeMergedCustomRef(custom, 103, { type: "suffix", value: "-B" })
    ).toBe("DOSSIER-3-B");
  });
});

describe("computeSearchField", () => {
  it("matches the UsagerSubscriber formula", () => {
    expect(
      computeSearchField(
        { nom: " Dupont ", prenom: "Émile", surnom: null },
        103,
        "DOSSIER-3"
      )
    ).toBe("dupont emile dossier 3");
    expect(
      computeSearchField(
        { nom: "Dupont", prenom: "Émile", surnom: "Mimile" },
        103,
        null
      )
    ).toBe("dupont emile mimile 103");
  });
});

describe("StructuresMergeService (database)", () => {
  let context: AppTestContext;
  let queryRunner: QueryRunner;
  let fileManagerService: FileManagerService;
  let service: StructuresMergeService;

  const SOURCE_ID = 3;
  const TARGET_ID = 1;
  const options: StructureMergeOptions = {
    source: SOURCE_ID,
    target: TARGET_ID,
    customRef: { type: "auto" },
  };

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({});
    fileManagerService = new FileManagerService();
    service = new StructuresMergeService(fileManagerService);
  });

  beforeEach(async () => {
    jest
      .spyOn(fileManagerService, "copyAllUnderPrefix")
      .mockResolvedValue({ total: 1, copied: 1, skipped: 0 });
    queryRunner = myDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  async function count(table: string, structureId: number): Promise<number> {
    const [{ count }] = await queryRunner.query(
      `SELECT count(*) AS count FROM "${table}" WHERE "structureId" = $1`,
      [structureId]
    );
    return Number(count);
  }

  async function expectFullyMerged(
    before: StructureMergeCounts,
    preflight: StructureMergePreflight
  ) {
    const after = await service.countRows(queryRunner, options);
    for (const table of STRUCTURE_MERGE_COUNTED_TABLES) {
      expect({ table, ...after[table] }).toEqual({
        table,
        source: 0,
        target: before[table].source + before[table].target,
      });
    }

    for (const ref of preflight.refs) {
      const [usager] = await queryRunner.query(
        `SELECT "structureId", "ref", "customRef", "nom_prenom_surnom_ref" FROM "usager" WHERE "uuid" = $1`,
        [ref.usagerUUID]
      );
      expect(usager).toEqual({
        structureId: TARGET_ID,
        ref: ref.oldRef + preflight.refOffset,
        customRef: ref.newCustomRef,
        nom_prenom_surnom_ref: ref.searchField,
      });

      for (const table of STRUCTURE_MERGE_DOSSIER_TABLES_WITH_REF) {
        const [{ count: mismatched }] = await queryRunner.query(
          `SELECT count(*) AS count FROM "${table}" WHERE "usagerUUID" = $1 AND ("usagerRef" <> $2 OR "structureId" <> $3)`,
          [ref.usagerUUID, ref.newRef, TARGET_ID]
        );
        expect({ table, mismatched: Number(mismatched) }).toEqual({
          table,
          mismatched: 0,
        });
      }
    }

    const [{ count: duplicates }] = await queryRunner.query(
      `SELECT count(*) AS count FROM (
         SELECT "ref" FROM "usager" WHERE "structureId" = $1 GROUP BY "ref" HAVING count(*) > 1
       ) d`,
      [TARGET_ID]
    );
    expect(Number(duplicates)).toBe(0);
  }

  it("refuses unknown or identical structures, a missing or colliding offset", async () => {
    expect(
      await service.preflight(queryRunner, { ...options, source: 999999 })
    ).toBeNull();
    await expect(
      service.merge(queryRunner, {
        ...options,
        target: SOURCE_ID,
        refOffset: 12,
      })
    ).rejects.toThrow("not found or identical");
    await expect(service.merge(queryRunner, options)).rejects.toThrow(
      "refOffset is required"
    );
    await expect(
      service.merge(queryRunner, { ...options, refOffset: 0 })
    ).rejects.toThrow("collides with target refs");
    expect(await count("usager", SOURCE_ID)).toBeGreaterThan(0);
  });

  it("moves every dossier, the bulk tables and the agents, renumbering refs everywhere, and leaves the rest on the source", async () => {
    const preflight = await service.preflight(queryRunner, options);
    const before = preflight.counts;
    expect(before.usager.source).toBeGreaterThan(0);
    expect(before.usager.target).toBeGreaterThan(0);
    expect(preflight.refOffset).toBe(12);
    expect(preflight.refCollisions).toEqual([]);
    const contactSupportBefore = await count("contact_support", SOURCE_ID);
    const smsSourceBefore = await count("message_sms", SOURCE_ID);
    const smsTargetBefore = await count("message_sms", TARGET_ID);
    const smsRefs: { usagerRef: number }[] = await queryRunner.query(
      `SELECT "usagerRef" FROM "message_sms" WHERE "structureId" = $1 ORDER BY "usagerRef"`,
      [SOURCE_ID]
    );

    const result = await service.merge(queryRunner, {
      ...options,
      refOffset: preflight.refOffset,
    });

    expect(result.dossiers).toBe(before.usager.source);
    expect(result.files.copied).toBe(before.usager.source);
    expect(result.before).toEqual(before);
    expect(result.after.user_structure).toEqual({
      source: 0,
      target: before.user_structure.source + before.user_structure.target,
    });
    expect(await count("message_sms", SOURCE_ID)).toBe(0);
    expect(await count("message_sms", TARGET_ID)).toBe(
      smsSourceBefore + smsTargetBefore
    );
    for (const { usagerRef } of smsRefs) {
      const [{ count: shifted }] = await queryRunner.query(
        `SELECT count(*) AS count FROM "message_sms" WHERE "structureId" = $1 AND "usagerRef" = $2`,
        [TARGET_ID, usagerRef + preflight.refOffset]
      );
      expect(Number(shifted)).toBeGreaterThan(0);
    }
    expect(await count("contact_support", SOURCE_ID)).toBe(
      contactSupportBefore
    );

    await expectFullyMerged(before, preflight);
  });

  it("resumes after an interruption without touching dossiers already moved", async () => {
    const preflight = await service.preflight(queryRunner, options);
    const before = preflight.counts;
    const merged = { ...options, refOffset: preflight.refOffset };

    const copySpy = jest.spyOn(fileManagerService, "copyAllUnderPrefix");
    copySpy.mockReset();
    copySpy
      .mockResolvedValueOnce({ total: 1, copied: 1, skipped: 0 })
      .mockResolvedValueOnce({ total: 1, copied: 1, skipped: 0 })
      .mockRejectedValueOnce(new Error("S3 down"));

    await expect(service.merge(queryRunner, merged)).rejects.toThrow("S3 down");

    expect(await count("usager", SOURCE_ID)).toBe(before.usager.source - 2);
    expect(await count("user_structure", SOURCE_ID)).toBe(
      before.user_structure.source
    );
    const [first, second] = preflight.refs;
    for (const ref of [first, second]) {
      const [usager] = await queryRunner.query(
        `SELECT "structureId", "ref" FROM "usager" WHERE "uuid" = $1`,
        [ref.usagerUUID]
      );
      expect(usager).toEqual({ structureId: TARGET_ID, ref: ref.newRef });
    }

    const resumed = await service.preflight(queryRunner, merged);
    expect(resumed.refOffset).toBe(preflight.refOffset);
    expect(resumed.refs.length).toBe(preflight.refs.length - 2);
    expect(resumed.refs[0].usagerUUID).toBe(preflight.refs[2].usagerUUID);

    copySpy.mockResolvedValue({ total: 1, copied: 0, skipped: 1 });
    const result = await service.merge(queryRunner, merged);
    expect(result.dossiers).toBe(preflight.refs.length - 2);

    await expectFullyMerged(before, preflight);
  });
});
