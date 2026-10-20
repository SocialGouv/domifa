import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { In } from "typeorm";
import { userSupervisorRepository } from "../../../../database";
import { UserAdminAuthenticated } from "../../../../_common/model";
import { USER_SUPERVISOR_AUTH } from "../../../../_common/mocks/USER_SUPERVISOR_AUTHENTIFICATED.mock";
import { AppTestHelper } from "../../../../util/test";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { AdminSuperivorUsersService } from "../admin-superivor-users/admin-superivor-users.service";
import { UserSupervisorDecisionService } from "../user-supervisor-decision/user-supervisor-decision.service";
import { RegionDepartmentUsersService } from "./region-department-users.service";

// Bretagne (53) = 22, 29, 35, 56
const DREETS_BRETAGNE: UserAdminAuthenticated = {
  ...USER_SUPERVISOR_AUTH,
  role: "region",
  territories: ["53"],
};

const DDETS_EMAIL = "jean.dupont@ille-et-vilaine.gouv.fr";
const OTHER_REGION_EMAIL = "marie.martin@nord.gouv.fr";

describe("RegionDepartmentUsersService", () => {
  let service: RegionDepartmentUsersService;

  const cleanup = () =>
    userSupervisorRepository.delete({
      email: In([DDETS_EMAIL, OTHER_REGION_EMAIL]),
    });

  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionDepartmentUsersService,
        AppLogsService,
        BrevoSenderService,
        AdminSuperivorUsersService,
        UserSupervisorDecisionService,
      ],
    }).compile();
    service = module.get(RegionDepartmentUsersService);
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await userSupervisorRepository
      .createQueryBuilder()
      .delete()
      .where("email LIKE :email", { email: `deleted-%-${DDETS_EMAIL}` })
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
        department: "59",
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("creates, lists then soft-deletes a DDETS of the region", async () => {
    await service.create(DREETS_BRETAGNE, {
      prenom: "Jean",
      nom: "Dupont",
      email: DDETS_EMAIL,
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
});
