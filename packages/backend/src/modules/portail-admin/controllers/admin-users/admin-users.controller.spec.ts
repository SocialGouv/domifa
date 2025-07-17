import { Test, TestingModule } from "@nestjs/testing";
import { AdminUsersController } from "./admin-users.controller";
import { forwardRef, HttpStatus } from "@nestjs/common";
import { UsagersModule } from "../../../../usagers/usagers.module";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { InteractionsModule } from "../../../interactions/interactions.module";
import { SmsModule } from "../../../sms/sms.module";
import { StructuresModule } from "../../../structures/structure.module";
import { UsersModule } from "../../../users/users.module";
import { AdminStructuresService } from "../../services";
import { AdminSuperivorUsersService } from "../../services/admin-superivor-users/admin-superivor-users.service";
import { ElevateUserRoleDto } from "../../dto/elevate-user-role.dto";
import { userStructureRepository } from "../../../../database";
import { EntityNotFoundError } from "typeorm";
import { USER_STRUCTURE_AUTH } from "../../../../_common/mocks/USER_STRUCTURE_AUTHENTIFICATED.mock";
// Mock the repository
jest.mock("../../../../database", () => ({
  userStructureRepository: {
    findOneByOrFail: jest.fn(),
    update: jest.fn(),
  },
}));

describe("AdminUsersController", () => {
  let controller: AdminUsersController;
  let mockUserStructureRepository: jest.Mocked<typeof userStructureRepository>;

  const mockCurrentUser = USER_STRUCTURE_AUTH;

  const mockUserToElevate = {
    id: 2,
    uuid: "user-uuid-456",
    nom: "User",
    prenom: "Simple",
    email: "user@test.com",
    role: "simple",
    structureId: 1,
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => StructuresModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => InteractionsModule),
        forwardRef(() => SmsModule),
      ],
      providers: [
        AdminStructuresService,
        {
          provide: AppLogsService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
          },
        },
        AdminSuperivorUsersService,
      ],
    }).compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
    mockUserStructureRepository = userStructureRepository as jest.Mocked<
      typeof userStructureRepository
    >;
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("elevateUserRoleToAdmin", () => {
    it("should successfully elevate user role to admin", async () => {
      // Arrange
      const elevateRoleDto: ElevateUserRoleDto = {
        uuid: "user-uuid-456",
      };

      mockUserStructureRepository.findOneByOrFail.mockResolvedValue(
        mockUserToElevate as any
      );
      mockUserStructureRepository.update.mockResolvedValue({} as any);

      // Act
      await controller.elevateUserRoleToAdmin(
        mockCurrentUser,
        mockResponse as any,
        elevateRoleDto
      );

      // Assert
      expect(mockUserStructureRepository.findOneByOrFail).toHaveBeenCalledWith({
        uuid: "user-uuid-456",
      });
      expect(mockUserStructureRepository.update).toHaveBeenCalledWith(
        { uuid: "user-uuid-456" },
        { role: "admin" }
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: "OK",
      });
    });

    it("should return BAD_REQUEST when user is not found", async () => {
      // Arrange
      const elevateRoleDto: ElevateUserRoleDto = {
        uuid: "non-existent-uuid",
      };

      mockUserStructureRepository.findOneByOrFail.mockRejectedValue(
        new EntityNotFoundError("UserStructureTable", {})
      );

      // Act
      await controller.elevateUserRoleToAdmin(
        mockCurrentUser,
        mockResponse as any,
        elevateRoleDto
      );

      // Assert
      expect(mockUserStructureRepository.findOneByOrFail).toHaveBeenCalledWith({
        uuid: "non-existent-uuid",
      });
      expect(mockUserStructureRepository.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: "UNABLE_TO_ELEVATE_USER_ROLE",
      });
    });

    it("should return BAD_REQUEST when database update fails", async () => {
      // Arrange
      const elevateRoleDto: ElevateUserRoleDto = {
        uuid: "user-uuid-456",
      };

      mockUserStructureRepository.findOneByOrFail.mockResolvedValue(
        mockUserToElevate as any
      );
      mockUserStructureRepository.update.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      await controller.elevateUserRoleToAdmin(
        mockCurrentUser,
        mockResponse as any,
        elevateRoleDto
      );

      // Assert
      expect(mockUserStructureRepository.findOneByOrFail).toHaveBeenCalledWith({
        uuid: "user-uuid-456",
      });
      expect(mockUserStructureRepository.update).toHaveBeenCalledWith(
        { uuid: "user-uuid-456" },
        { role: "admin" }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: "UNABLE_TO_ELEVATE_USER_ROLE",
      });
    });

    it("should handle invalid UUID format", async () => {
      // Arrange
      const elevateRoleDto: ElevateUserRoleDto = {
        uuid: "invalid-uuid",
      };

      mockUserStructureRepository.findOneByOrFail.mockRejectedValue(
        new Error("Invalid UUID format")
      );

      // Act
      await controller.elevateUserRoleToAdmin(
        mockCurrentUser,
        mockResponse as any,
        elevateRoleDto
      );

      // Assert
      expect(mockUserStructureRepository.findOneByOrFail).toHaveBeenCalledWith({
        uuid: "invalid-uuid",
      });
      expect(mockUserStructureRepository.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: "UNABLE_TO_ELEVATE_USER_ROLE",
      });
    });
  });
});
