import { subMonths } from "date-fns";
import {
  appLogsRepository,
  InactiveStructure,
  structureRepository,
  userStructureRepository,
} from "../../../../database";
import { StructureDecisionService } from "../structure-decision/structure-decision.service";
import { StructureDecisionEmailService } from "../structure-decision-email/structure-decision-email.service";
import {
  INACTIVE_STRUCTURE_MONTHS,
  InactiveStructuresCleanerService,
} from "./inactive-structures-cleaner.service";

const buildStructure = (
  overrides: Partial<InactiveStructure> = {}
): InactiveStructure => ({
  id: 42,
  uuid: "structure-uuid",
  nom: "CCAS de Test",
  email: "contact@ccas-test.fr",
  registrationDate: new Date("2020-01-01"),
  lastLogin: new Date("2024-03-15"),
  referenceDate: new Date("2024-03-15"),
  ...overrides,
});

describe("InactiveStructuresCleanerService", () => {
  let service: InactiveStructuresCleanerService;
  let structureDecisionService: jest.Mocked<
    Pick<
      StructureDecisionService,
      "updateStructureStatut" | "deleteStructureData"
    >
  >;
  let emailService: jest.Mocked<
    Pick<StructureDecisionEmailService, "sendInactiveStructureDeletedEmail">
  >;
  let findInactiveSpy: jest.SpyInstance;
  let saveLogSpy: jest.SpyInstance;

  beforeEach(() => {
    structureDecisionService = {
      updateStructureStatut: jest.fn().mockResolvedValue(undefined),
      deleteStructureData: jest.fn().mockResolvedValue(undefined),
    };
    emailService = {
      sendInactiveStructureDeletedEmail: jest.fn().mockResolvedValue(undefined),
    };
    service = new InactiveStructuresCleanerService(
      structureDecisionService as unknown as StructureDecisionService,
      emailService as unknown as StructureDecisionEmailService
    );

    findInactiveSpy = jest
      .spyOn(structureRepository, "findInactiveStructures")
      .mockResolvedValue([buildStructure()]);
    jest.spyOn(userStructureRepository, "find").mockResolvedValue([
      { email: "admin@ccas-test.fr", prenom: "Camille" },
      // Same address as the structure contact: must not be emailed twice
      { email: "CONTACT@ccas-test.fr", prenom: "Dominique" },
    ] as any);
    jest
      .spyOn(appLogsRepository, "create")
      .mockImplementation((log: any) => log);
    saveLogSpy = jest
      .spyOn(appLogsRepository, "save")
      .mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(`looks for structures inactive for ${INACTIVE_STRUCTURE_MONTHS} months`, async () => {
    await service.deleteInactiveStructures({ dryRun: true });

    const inactiveSince: Date = findInactiveSpy.mock.calls[0][0];
    const expected = subMonths(new Date(), INACTIVE_STRUCTURE_MONTHS);
    expect(Math.abs(inactiveSince.getTime() - expected.getTime())).toBeLessThan(
      5000
    );
  });

  it("dry-run lists eligible structures without deleting anything", async () => {
    const result = await service.deleteInactiveStructures({ dryRun: true });

    expect(result.map(({ id }) => id)).toEqual([42]);
    expect(
      structureDecisionService.updateStructureStatut
    ).not.toHaveBeenCalled();
    expect(structureDecisionService.deleteStructureData).not.toHaveBeenCalled();
    expect(
      emailService.sendInactiveStructureDeletedEmail
    ).not.toHaveBeenCalled();
    expect(saveLogSpy).not.toHaveBeenCalled();
  });

  it("deletes through the manual deletion path with motif INACTIF", async () => {
    const result = await service.deleteInactiveStructures({ dryRun: false });

    expect(result.map(({ id }) => id)).toEqual([42]);
    expect(structureDecisionService.updateStructureStatut).toHaveBeenCalledWith(
      42,
      "SUPPRIME",
      expect.objectContaining({ statut: "SUPPRIME", motif: "INACTIF" })
    );
    expect(structureDecisionService.deleteStructureData).toHaveBeenCalledWith(
      expect.objectContaining({ id: 42, uuid: "structure-uuid" })
    );
  });

  it("logs each automatic deletion with the reference date", async () => {
    await service.deleteInactiveStructures({ dryRun: false });

    expect(saveLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userType: "system",
        structureId: 42,
        action: "STRUCTURE_INACTIVE_AUTO_DELETE",
        context: expect.objectContaining({
          referenceDate: new Date("2024-03-15"),
          lastLogin: new Date("2024-03-15"),
          deletedAt: expect.any(Date),
        }),
      })
    );
  });

  it("emails each admin and the structure address once", async () => {
    await service.deleteInactiveStructures({ dryRun: false });

    const calls = emailService.sendInactiveStructureDeletedEmail.mock.calls;
    expect(calls.map(([{ to }]) => to.email)).toEqual([
      "admin@ccas-test.fr",
      "CONTACT@ccas-test.fr",
    ]);
    expect(calls[0][0].params).toEqual({
      prenom: "Camille",
      structure_nom: "CCAS de Test",
      date_suppression: expect.stringMatching(/^\d{2}\/\d{2}\/\d{4}$/),
      date_derniere_connexion: "15/03/2024",
    });
  });

  it("sends an empty last login date when nobody ever logged in", async () => {
    findInactiveSpy.mockResolvedValue([buildStructure({ lastLogin: null })]);

    await service.deleteInactiveStructures({ dryRun: false });

    expect(
      emailService.sendInactiveStructureDeletedEmail.mock.calls[0][0].params
        .date_derniere_connexion
    ).toEqual("");
  });

  it("keeps going when one structure fails", async () => {
    findInactiveSpy.mockResolvedValue([
      buildStructure({ id: 1 }),
      buildStructure({ id: 2 }),
    ]);
    structureDecisionService.deleteStructureData.mockRejectedValueOnce(
      new Error("S3 down")
    );

    const result = await service.deleteInactiveStructures({ dryRun: false });

    expect(result.map(({ id }) => id)).toEqual([2]);
  });

  it("does not fail the deletion when the email cannot be sent", async () => {
    emailService.sendInactiveStructureDeletedEmail.mockRejectedValue(
      new Error("Brevo down")
    );

    const result = await service.deleteInactiveStructures({ dryRun: false });

    expect(result.map(({ id }) => id)).toEqual([42]);
    expect(saveLogSpy).toHaveBeenCalled();
  });
});
