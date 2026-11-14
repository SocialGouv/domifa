import { userStructureRepository } from "../../../../database";
import { domifaConfig } from "../../../../config";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { UserStructureAuthenticated } from "../../../../_common/model";
import { UserStructureDecisionService } from "./user-structure-decision.service";

const TARGET = {
  targetUserId: 7,
  targetUserEmail: "camille@ccas-test.fr",
  targetUserPrenom: "Camille",
  targetUserRole: "simple" as const,
  structureId: 42,
};

describe("UserStructureDecisionService.softDelete", () => {
  let service: UserStructureDecisionService;
  let brevoSenderService: jest.Mocked<
    Pick<
      BrevoSenderService,
      | "sendEmailWithTemplate"
      | "updateContactStatusInBrevo"
      | "removeContactFromUsersList"
    >
  >;
  let appLogsService: jest.Mocked<Pick<AppLogsService, "create">>;
  let updateSpy: jest.SpyInstance;

  beforeEach(() => {
    brevoSenderService = {
      sendEmailWithTemplate: jest.fn().mockResolvedValue(undefined),
      updateContactStatusInBrevo: jest.fn().mockResolvedValue(undefined),
      removeContactFromUsersList: jest.fn().mockResolvedValue(undefined),
    };
    appLogsService = { create: jest.fn().mockResolvedValue(undefined) };
    service = new UserStructureDecisionService(
      brevoSenderService as unknown as BrevoSenderService,
      appLogsService as unknown as AppLogsService
    );
    updateSpy = jest
      .spyOn(userStructureRepository, "update")
      .mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sends the manual deletion email to the address captured before deletion", async () => {
    await service.softDelete({
      ...TARGET,
      motif: "DEPART_STRUCTURE",
      actor: {
        kind: "structure",
        user: {
          id: 1,
          prenom: "Dominique",
          nom: "Admin",
          role: "admin",
          structureId: 42,
        } as UserStructureAuthenticated,
      },
    });

    const update = updateSpy.mock.calls[0][1];
    expect(update.status).toEqual("DELETE");
    expect(update.email).toMatch(/^deleted-\d{8}-camille@ccas-test\.fr$/);
    expect(update.decision).toMatchObject({
      userId: 1,
      userName: "Dominique Admin",
    });

    expect(brevoSenderService.sendEmailWithTemplate).toHaveBeenCalledWith({
      templateId: domifaConfig().brevo.templates.userManualDelete,
      to: [{ email: "camille@ccas-test.fr", name: "Camille" }],
      params: {
        prenom: "Camille",
        motif: "Ne travaille plus dans la structure",
      },
    });
    expect(appLogsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: "ADMIN_SOFT_DELETE_USER_STRUCTURE" })
    );
  });

  it("does not fail the deletion when the email cannot be sent", async () => {
    brevoSenderService.sendEmailWithTemplate.mockRejectedValue(
      new Error("Brevo down")
    );

    await expect(
      service.softDelete({
        ...TARGET,
        motif: "COMPTE_TEST",
        actor: {
          kind: "structure",
          user: { id: 1 } as UserStructureAuthenticated,
        },
      })
    ).resolves.toBeUndefined();
    expect(updateSpy).toHaveBeenCalled();
  });

  it("logs an automatic deletion as system, without the manual email", async () => {
    const lastLogin = new Date("2025-09-01");

    await service.softDelete({
      ...TARGET,
      motif: "INACTIF_PLUS_D_UN_AN",
      actor: { kind: "system" },
      logContext: {
        lastLogin,
        referenceDate: lastLogin,
        structureLeftWithoutAdmin: false,
      },
    });

    expect(updateSpy.mock.calls[0][1].decision).toMatchObject({
      userId: 0,
      userName: "DomiFa (automatique)",
      motif: "INACTIF_PLUS_D_UN_AN",
    });
    expect(brevoSenderService.sendEmailWithTemplate).not.toHaveBeenCalled();
    expect(appLogsService.create).toHaveBeenCalledWith({
      userType: "system",
      structureId: 42,
      action: "USER_INACTIVE_AUTO_DELETE",
      context: {
        userId: 7,
        role: "simple",
        motif: "INACTIF_PLUS_D_UN_AN",
        lastLogin,
        referenceDate: lastLogin,
        structureLeftWithoutAdmin: false,
      },
    });
  });
});
