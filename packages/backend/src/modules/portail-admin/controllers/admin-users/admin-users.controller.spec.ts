import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AdminUsersController } from "./admin-users.controller";
import { AdminSuperivorUsersService } from "../../services/admin-superivor-users/admin-superivor-users.service";
import { AdminStructuresService } from "../../services/admin-structures.service";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { ElevateUserRoleDto } from "../../dto/elevate-user-role.dto";
import { USER_SUPERVISOR_AUTH } from "../../../../_common/mocks/USER_SUPERVISOR_AUTHENTIFICATED.mock";
import { TESTS_USERS_STRUCTURE } from "../../../../_tests";
import { AppTestHelper } from "../../../../util/test";
import { userStructureRepository } from "../../../../database";

describe("AdminUsersController", () => {
  let controller: AdminUsersController;

  const currentUser = USER_SUPERVISOR_AUTH;
  const simpleUser =
    TESTS_USERS_STRUCTURE.BY_EMAIL["s1-instructeur@yopmail.com"];
  const adminUser =
    TESTS_USERS_STRUCTURE.BY_EMAIL["preprod.domifa@fabrique.social.gouv.fr"];

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };

  beforeAll(async () => {
    await AppTestHelper.bootstrapTestConnection();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: AppLogsService,
          useValue: { create: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: AdminSuperivorUsersService,
          useValue: { createUserWithTmpToken: jest.fn() },
        },
        {
          provide: AdminStructuresService,
          useValue: { getUsersForAdmin: jest.fn() },
        },
        {
          provide: BrevoSenderService,
          useValue: {
            sendEmailWithTemplate: jest.fn().mockResolvedValue({}),
            sendUserActivationEmail: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestConnection();
  });

  beforeEach(() => {
    mockResponse.status.mockClear();
    mockResponse.send.mockClear();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("elevateUserRoleToAdmin", () => {
    it("should successfully elevate a non-admin user to admin", async () => {
      const elevateRoleDto: ElevateUserRoleDto = { uuid: simpleUser.uuid };

      const before = await userStructureRepository.findOneBy({
        uuid: simpleUser.uuid,
      });
      expect(before.role).toEqual("simple");

      await controller.elevateUserRoleToAdmin(
        currentUser,
        mockResponse as any,
        elevateRoleDto
      );

      const after = await userStructureRepository.findOneBy({
        uuid: simpleUser.uuid,
      });
      expect(after.role).toEqual("admin");

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: "OK" });

      // restore original role
      await userStructureRepository.update(
        { uuid: simpleUser.uuid },
        { role: simpleUser.role }
      );
    });

    it("should return BAD_REQUEST when user is not found", async () => {
      const elevateRoleDto: ElevateUserRoleDto = {
        uuid: "00000000-0000-0000-0000-000000000000",
      };

      await controller.elevateUserRoleToAdmin(
        currentUser,
        mockResponse as any,
        elevateRoleDto
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: "UNABLE_TO_ELEVATE_USER_ROLE",
      });
    });

    it("should return BAD_REQUEST when user is already admin", async () => {
      const elevateRoleDto: ElevateUserRoleDto = { uuid: adminUser.uuid };

      await controller.elevateUserRoleToAdmin(
        currentUser,
        mockResponse as any,
        elevateRoleDto
      );

      const target = await userStructureRepository.findOneBy({
        uuid: adminUser.uuid,
      });
      expect(target.role).toEqual("admin");

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: "UNABLE_TO_ELEVATE_USER_ROLE",
      });
    });

    it("should return BAD_REQUEST when uuid format is invalid", async () => {
      const elevateRoleDto: ElevateUserRoleDto = { uuid: "invalid-uuid" };

      await controller.elevateUserRoleToAdmin(
        currentUser,
        mockResponse as any,
        elevateRoleDto
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: "UNABLE_TO_ELEVATE_USER_ROLE",
      });
    });
  });
});
