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

  // Structures and rows are seeded inside the rolled-back transaction, with
  // ids taken from the sequences: the spec never depends on the shared
  // fixtures, which other specs running against the same database mutate.
  let SOURCE_ID: number;
  let TARGET_ID: number;
  let options: StructureMergeOptions;

  async function seedStructure(name: string): Promise<number> {
    const [{ id }] = await queryRunner.query(
      `INSERT INTO "structure"
         (version, adresse, "codePostal", departement, region, email,
          "registrationDate", nom, options, responsable, "structureType",
          ville, "timeZone", telephone, decision, statut)
       VALUES (1, '1 rue du test', '75001', '75', '11', $1, now(), $2, '{}',
          '{"nom": "Test", "prenom": "Test", "fonction": "Test"}', 'asso',
          'Paris', 'Europe/Paris', '{"countryCode": "fr", "numero": "0601020304"}',
          '{"statut": "VALIDE"}', 'VALIDE')
       RETURNING id`,
      [`${name}@yopmail.com`, name]
    );
    return id;
  }

  async function seedUsager(
    structureId: number,
    ref: number,
    customRef: string | null
  ): Promise<string> {
    const [{ uuid }] = await queryRunner.query(
      `INSERT INTO "usager"
         (version, ref, "customRef", "structureId", nom, prenom, sexe,
          "dateNaissance", "villeNaissance", decision, historique,
          "lastInteraction", options, telephone, nom_prenom_surnom_ref)
       VALUES (1, $1, $2, $3, $4, 'Test', 'homme', '1980-01-01', 'Paris',
          '{"statut": "VALIDE"}', '[]', '{}', '{}',
          '{"countryCode": "fr", "numero": "0601020304"}', $5)
       RETURNING uuid`,
      [ref, customRef, structureId, `Usager${ref}`, `usager${ref} test ${ref}`]
    );
    return uuid;
  }

  async function seedDossierRows(
    structureId: number,
    uuid: string,
    ref: number
  ): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "usager_entretien" (version, "usagerUUID", "structureId", "usagerRef")
       VALUES (1, $1, $2, $3)`,
      [uuid, structureId, ref]
    );
    await queryRunner.query(
      `INSERT INTO "usager_notes" (version, "usagerUUID", "structureId", "usagerRef", message)
       VALUES (1, $1, $2, $3, 'note')`,
      [uuid, structureId, ref]
    );
    await queryRunner.query(
      `INSERT INTO "usager_docs"
         (version, "usagerUUID", "structureId", "usagerRef", path, label, filetype, "createdBy")
       VALUES (1, $1, $2, $3, 'doc.pdf', 'doc', 'application/pdf', 'Agent Test')`,
      [uuid, structureId, ref]
    );
    await queryRunner.query(
      `INSERT INTO "interactions"
         (version, "dateInteraction", "structureId", type, "usagerRef", "userName", "usagerUUID")
       VALUES (1, now(), $1, 'courrierIn', $2, 'Agent Test', $3)`,
      [structureId, ref, uuid]
    );
    await queryRunner.query(
      `INSERT INTO "usager_history_states"
         (version, "usagerUUID", "structureId", "ayantsDroits", decision,
          entretien, "createdEvent", "historyBeginDate")
       VALUES (1, $1, $2, '[]', '{"statut": "VALIDE"}', '{}', 'new-decision', now())`,
      [uuid, structureId]
    );
    await queryRunner.query(
      `INSERT INTO "usager_options_history"
         (version, "usagerUUID", "structureId", action, type)
       VALUES (1, $1, $2, 'ENABLE', 'transfert')`,
      [uuid, structureId]
    );
    const [{ id: userUsagerId }] = await queryRunner.query(
      `INSERT INTO "user_usager" (version, "usagerUUID", "structureId", login, password, salt)
       VALUES (1, $1, $2, $3, 'password-hash', 'salt')
       RETURNING id`,
      [uuid, structureId, `merge-spec-${uuid}`]
    );
    await queryRunner.query(
      `INSERT INTO "user_usager_login" (version, "usagerUUID", "structureId")
       VALUES (1, $1, $2)`,
      [uuid, structureId]
    );
    await queryRunner.query(
      `INSERT INTO "user_usager_security" (version, "userId", "structureId")
       VALUES (1, $1, $2)`,
      [userUsagerId, structureId]
    );
  }

  async function seedAgent(
    structureId: number,
    email: string
  ): Promise<number> {
    const [{ id }] = await queryRunner.query(
      `INSERT INTO "user_structure" (version, email, nom, password, prenom, "structureId")
       VALUES (1, $1, 'Agent', 'password-hash', 'Test', $2)
       RETURNING id`,
      [email, structureId]
    );
    await queryRunner.query(
      `INSERT INTO "user_structure_security" (version, "userId", "structureId")
       VALUES (1, $1, $2)`,
      [id, structureId]
    );
    return id;
  }

  async function seedSms(structureId: number, ref: number): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "message_sms"
         (version, "usagerRef", "structureId", content, "smsId",
          "scheduledDate", "phoneNumber", "senderName")
       VALUES (1, $1, $2, 'sms', 'sms-id', now(), '0601020304', 'DomiFa')`,
      [ref, structureId]
    );
  }

  async function seedMergeData(): Promise<void> {
    SOURCE_ID = await seedStructure("merge-spec-source");
    TARGET_ID = await seedStructure("merge-spec-target");
    options = {
      source: SOURCE_ID,
      target: TARGET_ID,
      customRef: { type: "auto" },
    };

    // 4 dossiers on the source (the resume test interrupts on the third),
    // one of them with a customised ref
    for (const [ref, customRef] of [
      [1, null],
      [2, "DOSSIER-2"],
      [3, null],
      [4, null],
    ] as const) {
      const uuid = await seedUsager(SOURCE_ID, ref, customRef);
      await seedDossierRows(SOURCE_ID, uuid, ref);
    }
    // target refs 1 (collision when refOffset is 0) and 12 (the refOffset)
    await seedUsager(TARGET_ID, 1, null);
    await seedUsager(TARGET_ID, 12, null);

    const sourceAgentId = await seedAgent(
      SOURCE_ID,
      "merge-spec-agent-source@yopmail.com"
    );
    await seedAgent(SOURCE_ID, "merge-spec-agent-source-2@yopmail.com");
    await seedAgent(TARGET_ID, "merge-spec-agent-target@yopmail.com");

    await seedSms(SOURCE_ID, 1);
    await seedSms(SOURCE_ID, 2);
    await seedSms(TARGET_ID, 1);
    await queryRunner.query(
      `INSERT INTO "app_log" (version, "usagerRef", "structureId", action)
       VALUES (1, 1, $1, 'MERGE_SPEC_TEST')`,
      [SOURCE_ID]
    );
    await queryRunner.query(
      `INSERT INTO "app_log_security" (version, "structureId", action)
       VALUES (1, $1, 'MERGE_SPEC_TEST')`,
      [SOURCE_ID]
    );
    await queryRunner.query(
      `INSERT INTO "expired_token" (version, "userId", "structureId", token, "userProfile")
       VALUES (1, $1, $2, 'token', 'structure')`,
      [sourceAgentId, SOURCE_ID]
    );
    await queryRunner.query(
      `INSERT INTO "contact_support" (version, "structureId", content, email, name)
       VALUES (1, $1, 'message', 'merge-spec-contact@yopmail.com', 'Test')`,
      [SOURCE_ID]
    );
  }

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
    await seedMergeData();
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
