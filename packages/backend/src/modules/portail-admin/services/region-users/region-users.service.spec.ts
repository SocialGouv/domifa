import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { In } from "typeorm";
import { userSupervisorRepository } from "../../../../database";
import { UserAdminAuthenticated } from "../../../../_common/model";
import { USER_SUPERVISOR_AUTH } from "../../../../_common/mocks/USER_SUPERVISOR_AUTHENTIFICATED.mock";
import { AppTestHelper } from "../../../../util/test";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { SecurityAlertEmailService } from "../../../security-monitoring/services/security-alert-email.service";
import { AdminSuperivorUsersService } from "../admin-superivor-users/admin-superivor-users.service";
import { UserSupervisorDecisionService } from "../user-supervisor-decision/user-supervisor-decision.service";
import { RegionUsersService } from "./region-users.service";

// Bretagne (53) = 22, 29, 35, 56
const DREETS_BRETAGNE: UserAdminAuthenticated = {
  ...USER_SUPERVISOR_AUTH,
  role: "region",
  territories: ["53"],
};

const DREETS_ILE_DE_FRANCE: UserAdminAuthenticated = {
  ...USER_SUPERVISOR_AUTH,
  role: "region",
  territories: ["11"],
};

const DREETS_GUYANE: UserAdminAuthenticated = {
  ...USER_SUPERVISOR_AUTH,
  role: "region",
  territories: ["03"],
};

const DDETS_EMAIL = "jean.dupont@ille-et-vilaine.gouv.fr";
const OTHER_REGION_EMAIL = "marie.martin@nord.gouv.fr";
const DREETS_EMAIL = "paul.durand@dreets.gouv.fr";
const OTHER_DREETS_EMAIL = "lea.bernard@dreets.gouv.fr";

describe("RegionUsersService", () => {
  let service: RegionUsersService;
  let securityAlertEmailService: SecurityAlertEmailService;

  const cleanup = () =>
    userSupervisorRepository.delete({
      email: In([
        DDETS_EMAIL,
        OTHER_REGION_EMAIL,
        DREETS_EMAIL,
        OTHER_DREETS_EMAIL,
      ]),
    });

  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionUsersService,
        AppLogsService,
        BrevoSenderService,
        AdminSuperivorUsersService,
        UserSupervisorDecisionService,
        SecurityAlertEmailService,
      ],
    }).compile();
    service = module.get(RegionUsersService);
    securityAlertEmailService = module.get(SecurityAlertEmailService);
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await userSupervisorRepository
      .createQueryBuilder()
      .delete()
      .where("email LIKE :ddets OR email LIKE :dreets", {
        ddets: `deleted-%-${DDETS_EMAIL}`,
        dreets: `deleted-%-${DREETS_EMAIL}`,
      })
      .execute();
    await AppTestHelper.tearDownTestConnection();
  });

  it("lists the departments of the DREETS region only", () => {
    expect(service.getManagedDepartments(DREETS_BRETAGNE).sort()).toEqual([
      "22",
      "29",
      "35",
      "56",
    ]);
    expect(service.getManagedDepartments(USER_SUPERVISOR_AUTH)).toEqual([]);
  });

  it("refuses to create a DDETS outside the region", async () => {
    await expect(
      service.create(DREETS_BRETAGNE, {
        prenom: "Marie",
        nom: "Martin",
        email: OTHER_REGION_EMAIL,
        role: "department",
        department: "59",
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("refuses an email domain that does not match the department", async () => {
    await expect(
      service.create(DREETS_BRETAGNE, {
        prenom: "Jean",
        nom: "Dupont",
        email: "jean.dupont@finistere.gouv.fr",
        role: "department",
        department: "35",
      })
    ).rejects.toThrow("EMAIL_DOMAIN_MISMATCH");
  });

  it("refuses a department outside the domain allowlist", async () => {
    await expect(
      service.create(DREETS_ILE_DE_FRANCE, {
        prenom: "Jean",
        nom: "Dupont",
        email: "jean.dupont@seine-saint-denis.gouv.fr",
        role: "department",
        department: "93",
      })
    ).rejects.toThrow("DEPARTMENT_NOT_SELF_SERVICE");
  });

  it("creates, lists then soft-deletes a DDETS of the region", async () => {
    await service.create(DREETS_BRETAGNE, {
      prenom: "Jean",
      nom: "Dupont",
      email: DDETS_EMAIL,
      role: "department",
      department: "35",
    });

    const created = await userSupervisorRepository.findOneByOrFail({
      email: DDETS_EMAIL,
    });
    expect(created.role).toEqual("department");
    expect(created.territories).toEqual(["35"]);

    const list = await service.findAll(DREETS_BRETAGNE);
    expect(list.map((u) => u.email)).toContain(DDETS_EMAIL);

    await expect(
      service.create(DREETS_BRETAGNE, {
        prenom: "Jean",
        nom: "Dupont",
        email: DDETS_EMAIL,
        role: "department",
        department: "35",
      })
    ).rejects.toThrow("EMAIL_ALREADY_EXISTS");

    await service.softDelete(DREETS_BRETAGNE, created.uuid, "DEPART_STRUCTURE");
    const deleted = await userSupervisorRepository.findOneByOrFail({
      uuid: created.uuid,
    });
    expect(deleted.status).toEqual("DELETE");
    expect(
      (await service.findAll(DREETS_BRETAGNE)).map((u) => u.uuid)
    ).not.toContain(created.uuid);
  });

  it("refuses to delete a DDETS outside the region", async () => {
    const outsider = await userSupervisorRepository.save({
      prenom: "Marie",
      nom: "Martin",
      email: OTHER_REGION_EMAIL,
      role: "department",
      territories: ["59"],
      status: "ACTIVE",
      password: "x",
    });

    await expect(
      service.softDelete(DREETS_BRETAGNE, outsider.uuid, "DEPART_STRUCTURE")
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(
      (await service.findAll(DREETS_BRETAGNE)).map((u) => u.uuid)
    ).not.toContain(outsider.uuid);
  });

  describe("regional accounts", () => {
    it("refuses a region outside the DREETS scope", async () => {
      await expect(
        service.create(DREETS_BRETAGNE, {
          prenom: "Paul",
          nom: "Durand",
          email: DREETS_EMAIL,
          role: "region",
          region: "32",
        })
      ).rejects.toThrow("REGION_OUTSIDE_SCOPE");
    });

    it("refuses a region outside the domain allowlist", async () => {
      await expect(
        service.create(DREETS_GUYANE, {
          prenom: "Paul",
          nom: "Durand",
          email: "paul.durand@dieccte.gouv.fr",
          role: "region",
          region: "03",
        })
      ).rejects.toThrow("REGION_NOT_SELF_SERVICE");
    });

    it("refuses a departmental or foreign regional domain", async () => {
      for (const email of [
        "paul.durand@ille-et-vilaine.gouv.fr",
        "paul.durand@drieets.gouv.fr",
      ]) {
        await expect(
          service.create(DREETS_BRETAGNE, {
            prenom: "Paul",
            nom: "Durand",
            email,
            role: "region",
            region: "53",
          })
        ).rejects.toThrow("EMAIL_DOMAIN_MISMATCH");
      }
    });

    it("creates a DREETS of the region, notifies DomiFa then deletes it", async () => {
      const notice = jest.spyOn(
        securityAlertEmailService,
        "sendRegionUserCreatedNotice"
      );

      await service.create(DREETS_BRETAGNE, {
        prenom: "Paul",
        nom: "Durand",
        email: DREETS_EMAIL,
        role: "region",
        region: "53",
      });

      const created = await userSupervisorRepository.findOneByOrFail({
        email: DREETS_EMAIL,
      });
      expect(created.role).toEqual("region");
      expect(created.territories).toEqual(["53"]);
      expect(notice).toHaveBeenCalledWith(
        expect.objectContaining({
          region: "53",
          createdUser: expect.objectContaining({ email: DREETS_EMAIL }),
        })
      );

      const list = await service.findAll(DREETS_BRETAGNE);
      expect(list.find((u) => u.uuid === created.uuid)?.role).toEqual("region");

      // A DREETS cannot delete its own account
      await expect(
        service.softDelete(
          { ...DREETS_BRETAGNE, _userId: created.id },
          created.uuid,
          "DEPART_STRUCTURE"
        )
      ).rejects.toThrow("CANNOT_DELETE_SELF");

      await service.softDelete(
        DREETS_BRETAGNE,
        created.uuid,
        "DEPART_STRUCTURE"
      );
      expect(
        (await service.findAll(DREETS_BRETAGNE)).map((u) => u.uuid)
      ).not.toContain(created.uuid);
    });

    it("does not list the DREETS of another region", async () => {
      const outsider = await userSupervisorRepository.save({
        prenom: "Léa",
        nom: "Bernard",
        email: OTHER_DREETS_EMAIL,
        role: "region",
        territories: ["32"],
        status: "ACTIVE",
        password: "x",
      });

      expect(
        (await service.findAll(DREETS_BRETAGNE)).map((u) => u.uuid)
      ).not.toContain(outsider.uuid);
      await expect(
        service.softDelete(DREETS_BRETAGNE, outsider.uuid, "DEPART_STRUCTURE")
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
