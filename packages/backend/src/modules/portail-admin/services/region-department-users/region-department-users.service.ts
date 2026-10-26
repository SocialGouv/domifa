import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Not } from "typeorm";
import {
  getRegionDepartmentCodes,
  isDdetsEmailForDepartment,
  isDdetsSelfServiceDepartment,
  RegionDepartmentUser,
  UserDeleteMotif,
} from "@domifa/common";
import { userSupervisorRepository } from "../../../../database";
import { UserAdminAuthenticated } from "../../../../_common/model";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { buildSupervisorActorFields } from "../../../app-logs/app-logs.helpers";
import { UserSupervisorCrudLogContext } from "../../../app-logs/types/app-log-context.types";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { RegisterDepartmentUserDto } from "../../dto";
import { AdminSuperivorUsersService } from "../admin-superivor-users/admin-superivor-users.service";
import { UserSupervisorDecisionService } from "../user-supervisor-decision/user-supervisor-decision.service";

// Lets a DREETS (role "region") manage the DDETS accounts (role "department")
// of the departments belonging to its region(s).
@Injectable()
export class RegionDepartmentUsersService {
  constructor(
    private readonly appLogsService: AppLogsService,
    private readonly brevoSenderService: BrevoSenderService,
    private readonly adminSuperivorUsersService: AdminSuperivorUsersService,
    private readonly userSupervisorDecisionService: UserSupervisorDecisionService
  ) {}

  public getManagedDepartments(user: UserAdminAuthenticated): string[] {
    if (user.role !== "region" || !user.territories?.length) {
      return [];
    }
    return getRegionDepartmentCodes(user.territories);
  }

  public async findAll(
    user: UserAdminAuthenticated
  ): Promise<RegionDepartmentUser[]> {
    const departments = this.getManagedDepartments(user);
    if (!departments.length) {
      return [];
    }

    const users = await userSupervisorRepository.find({
      where: { role: "department", status: Not("DELETE") },
      select: {
        uuid: true,
        nom: true,
        prenom: true,
        email: true,
        status: true,
        lastLogin: true,
        passwordLastUpdate: true,
        createdAt: true,
        territories: true,
      },
      order: { nom: "ASC", prenom: "ASC" },
    });

    return users.filter((u) => this.isManaged(u.territories, departments));
  }

  public async create(
    user: UserAdminAuthenticated,
    dto: RegisterDepartmentUserDto
  ): Promise<void> {
    if (!this.getManagedDepartments(user).includes(dto.department)) {
      throw new ForbiddenException("DEPARTMENT_OUTSIDE_REGION");
    }

    // Departments without a verified DDETS domain stay managed by DomiFa
    if (!isDdetsSelfServiceDepartment(dto.department)) {
      throw new ForbiddenException("DEPARTMENT_NOT_SELF_SERVICE");
    }

    if (!isDdetsEmailForDepartment(dto.email, dto.department)) {
      throw new BadRequestException("EMAIL_DOMAIN_MISMATCH");
    }

    const userExist = await userSupervisorRepository.findOneBy({
      email: dto.email.toLowerCase(),
    });
    if (userExist) {
      throw new BadRequestException("EMAIL_ALREADY_EXISTS");
    }

    const { user: newUser, userSecurity } =
      await this.adminSuperivorUsersService.createUserWithTmpToken({
        prenom: dto.prenom,
        nom: dto.nom,
        email: dto.email.toLowerCase(),
        role: "department",
        territories: [dto.department],
      });

    await this.brevoSenderService.sendPasswordSetupEmail({
      userId: newUser.id,
      userProfile: "supervisor",
      userSecurity,
    });

    await this.appLogsService.create<UserSupervisorCrudLogContext>({
      ...buildSupervisorActorFields(user),
      action: "ADMIN_USER_CREATE",
      context: { userId: newUser.id, role: "department" },
    });
  }

  public async softDelete(
    user: UserAdminAuthenticated,
    uuid: string,
    motif: UserDeleteMotif
  ): Promise<void> {
    const target = await userSupervisorRepository.findOneBy({
      uuid,
      role: "department",
      status: Not("DELETE"),
    });

    if (
      !target ||
      !this.isManaged(target.territories, this.getManagedDepartments(user))
    ) {
      throw new NotFoundException("USER_NOT_FOUND");
    }

    await this.userSupervisorDecisionService.softDelete({
      targetUserId: target.id,
      targetUserEmail: target.email,
      targetUserRole: target.role,
      motif,
      admin: user,
    });
  }

  // A DDETS account is managed by the DREETS only if every department it
  // covers belongs to the DREETS region(s).
  private isManaged(territories: string[], departments: string[]): boolean {
    return (
      territories?.length > 0 &&
      territories.every((code) => departments.includes(code))
    );
  }
}
