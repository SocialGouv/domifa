import { subMonths } from "date-fns";
import { domifaConfig } from "../../../../config";
import { InactiveUser, userStructureRepository } from "../../../../database";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { UserStructureDecisionService } from "../user-structure-decision/user-structure-decision.service";
import {
  INACTIVE_USER_MONTHS,
  InactiveUsersCleanerService,
} from "./inactive-users-cleaner.service";

const buildUser = (overrides: Partial<InactiveUser> = {}): InactiveUser => ({
  id: 7,
  structureId: 42,
  email: "camille@ccas-test.fr",
  prenom: "Camille",
  nom: "Martin",
  role: "simple",
  lastLogin: new Date("2025-09-15"),
  referenceDate: new Date("2025-09-15"),
  structureNom: "CCAS de Test",
  ...overrides,
});

describe("InactiveUsersCleanerService", () => {
  let service: InactiveUsersCleanerService;
  let decisionService: jest.Mocked<
    Pick<UserStructureDecisionService, "softDelete">
  >;
  let brevoSenderService: jest.Mocked<
    Pick<BrevoSenderService, "sendEmailWithTemplate">
  >;
  let findInactiveSpy: jest.SpyInstance;
  let countAdminsSpy: jest.SpyInstance;

  beforeEach(() => {
    decisionService = { softDelete: jest.fn().mockResolvedValue(undefined) };
    brevoSenderService = {
      sendEmailWithTemplate: jest.fn().mockResolvedValue(undefined),
    };
    service = new InactiveUsersCleanerService(
      decisionService as unknown as UserStructureDecisionService,
      brevoSenderService as unknown as BrevoSenderService
    );

    findInactiveSpy = jest
      .spyOn(userStructureRepository, "findInactiveUsers")
      .mockResolvedValue([buildUser()]);
    countAdminsSpy = jest
      .spyOn(userStructureRepository, "count")
      .mockResolvedValue(1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(`looks for users inactive for ${INACTIVE_USER_MONTHS} months`, async () => {
    await service.deleteInactiveUsers({ dryRun: true });

    const inactiveSince: Date = findInactiveSpy.mock.calls[0][0];
    const expected = subMonths(new Date(), INACTIVE_USER_MONTHS);
    expect(Math.abs(inactiveSince.getTime() - expected.getTime())).toBeLessThan(
      5000
    );
  });

  it("dry-run lists eligible users without deleting anything", async () => {
    const result = await service.deleteInactiveUsers({ dryRun: true });

    expect(result.map(({ id }) => id)).toEqual([7]);
    expect(decisionService.softDelete).not.toHaveBeenCalled();
    expect(brevoSenderService.sendEmailWithTemplate).not.toHaveBeenCalled();
  });

  it("soft deletes the user as system and sends the inactivity email", async () => {
    const result = await service.deleteInactiveUsers({ dryRun: false });

    expect(result.map(({ id }) => id)).toEqual([7]);
    expect(decisionService.softDelete).toHaveBeenCalledWith({
      targetUserId: 7,
      targetUserEmail: "camille@ccas-test.fr",
      targetUserPrenom: "Camille",
      targetUserRole: "simple",
      structureId: 42,
      motif: "INACTIF_PLUS_D_UN_AN",
      actor: { kind: "system" },
      logContext: {
        lastLogin: new Date("2025-09-15"),
        referenceDate: new Date("2025-09-15"),
        structureLeftWithoutAdmin: false,
      },
    });
    expect(brevoSenderService.sendEmailWithTemplate).toHaveBeenCalledWith({
      templateId: domifaConfig().brevo.templates.userInactiveDelete,
      to: [{ email: "camille@ccas-test.fr", name: "Camille" }],
      params: expect.objectContaining({
        prenom: "Camille",
        nom: "Martin",
        structure_nom: "CCAS de Test",
        date_derniere_connexion: "15/09/2025",
      }),
    });
  });

  it("sends an empty last login date for never-connected users", async () => {
    findInactiveSpy.mockResolvedValue([
      buildUser({ lastLogin: null, referenceDate: new Date("2024-01-10") }),
    ]);

    await service.deleteInactiveUsers({ dryRun: false });

    expect(
      brevoSenderService.sendEmailWithTemplate.mock.calls[0][0].params
        .date_derniere_connexion
    ).toEqual("");
  });

  it("keeps going when one deletion fails", async () => {
    findInactiveSpy.mockResolvedValue([
      buildUser({ id: 7 }),
      buildUser({ id: 8, email: "alex@ccas-test.fr" }),
    ]);
    decisionService.softDelete.mockRejectedValueOnce(new Error("DB error"));

    const result = await service.deleteInactiveUsers({ dryRun: false });

    expect(result.map(({ id }) => id)).toEqual([8]);
    expect(brevoSenderService.sendEmailWithTemplate).toHaveBeenCalledTimes(1);
  });

  it("does not check admins when no admin is deleted", async () => {
    await service.deleteInactiveUsers({ dryRun: false });

    expect(countAdminsSpy).not.toHaveBeenCalled();
  });

  it("flags the deletion of the last admin of a structure", async () => {
    findInactiveSpy.mockResolvedValue([
      buildUser({ id: 7, role: "admin" }),
      buildUser({ id: 8, role: "simple" }),
    ]);
    countAdminsSpy.mockResolvedValue(0);

    await service.deleteInactiveUsers({ dryRun: false });

    const flags = decisionService.softDelete.mock.calls.map(
      ([params]) => params.logContext?.structureLeftWithoutAdmin
    );
    expect(flags).toEqual([true, false]);
  });

  it("does not flag an admin deletion when another admin remains", async () => {
    findInactiveSpy.mockResolvedValue([buildUser({ role: "admin" })]);
    countAdminsSpy.mockResolvedValue(1);

    await service.deleteInactiveUsers({ dryRun: false });

    expect(
      decisionService.softDelete.mock.calls[0][0].logContext
        ?.structureLeftWithoutAdmin
    ).toBe(false);
  });
});
