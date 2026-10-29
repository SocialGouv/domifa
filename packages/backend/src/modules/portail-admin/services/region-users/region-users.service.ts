import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { In, Not } from "typeorm";
import {
  getRegionDepartmentCodes,
  isDdetsEmailForDepartment,
  isDdetsSelfServiceDepartment,
  isDreetsEmailForRegion,
  isDreetsSelfServiceRegion,
  REGION_MANAGED_ROLES,
  RegionManagedUser,
  UserDeleteMotif,
} from "@domifa/common";
import { userSupervisorRepository } from "../../../../database";
import { UserAdminAuthenticated } from "../../../../_common/model";
import { appLogger } from "../../../../util";
import { AppLogsService } from "../../../app-logs/app-logs.service";
import { buildSupervisorActorFields } from "../../../app-logs/app-logs.helpers";
import { UserSupervisorCrudLogContext } from "../../../app-logs/types/app-log-context.types";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { SecurityAlertEmailService } from "../../../security-monitoring/services/security-alert-email.service";
import { RegisterRegionUserDto } from "../../dto";
import { AdminSuperivorUsersService } from "../admin-superivor-users/admin-superivor-users.service";
import { UserSupervisorDecisionService } from "../user-supervisor-decision/user-supervisor-decision.service";

// Lets a DREETS (role "region") invite and delete DDETS accounts (role
// "department") of the departments of its region(s) and other DREETS accounts
// of its own region(s). A DREETS cannot delete its own account.
@Injectable()
export class RegionUsersService {
  constructor(
    private readonly appLogsService: AppLogsService,
    private readonly brevoSenderService: BrevoSenderService,
    private readonly adminSuperivorUsersService: AdminSuperivorUsersService,
    private readonly userSupervisorDecisionService: UserSupervisorDecisionService,
    private readonly securityAlertEmailService: SecurityAlertEmailService
  ) {}

  public getManagedDepartments(user: UserAdminAuthenticated): string[] {
    if (user.role !== "region" || !user.territories?.length) {
      return [];
    }
    return getRegionDepartmentCodes(user.territories);
  }

  public getManagedRegions(user: UserAdminAuthenticated): string[] {
    if (user.role !== "region" || !user.territories?.length) {
      return [];
    }
    return user.territories;
  }

  public async findAll(
    user: UserAdminAuthenticated
  ): Promise<RegionManagedUser[]> {
    const departments = this.getManagedDepartments(user);
    const regions = this.getManagedRegions(user);
    if (!departments.length) {
      return [];
    }

    const users = await userSupervisorRepository.find({
      where: { role: In([...REGION_MANAGED_ROLES]), status: Not("DELETE") },
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
        role: true,
      },
      order: { nom: "ASC", prenom: "ASC" },
    });

    return users.filter((u) =>
      this.isManaged(u.territories, u.role === "region" ? regions : departments)
    );
  }

  public async create(
    user: UserAdminAuthenticated,
    dto: RegisterRegionUserDto
  ): Promise<void> {
    const territory =
      dto.role === "region"
        ? this.checkRegionTerritory(user, dto)
        : this.checkDepartmentTerritory(user, dto);

    const email = dto.email.toLowerCase();
    const userExist = await userSupervisorRepository.findOneBy({ email });
    if (userExist) {
      throw new BadRequestException("EMAIL_ALREADY_EXISTS");
    }

    const { user: newUser, userSecurity } =
      await this.adminSuperivorUsersService.createUserWithTmpToken({
        prenom: dto.prenom,
        nom: dto.nom,
        email,
        role: dto.role,
        territories: [territory],
      });

    await this.brevoSenderService.sendPasswordSetupEmail({
      userId: newUser.id,
      userProfile: "supervisor",
      userSecurity,
    });

    await this.appLogsService.create<UserSupervisorCrudLogContext>({
      ...buildSupervisorActorFields(user),
      action: "ADMIN_USER_CREATE",
      context: { userId: newUser.id, role: dto.role },
    });

    if (dto.role === "region") {
      // The account exists already: a mail failure must not fail the request
      await this.securityAlertEmailService
        .sendRegionUserCreatedNotice({
          createdAt: new Date(),
          region: territory,
          creator: user,
          createdUser: { prenom: dto.prenom, nom: dto.nom, email },
        })
        .catch((error) =>
          appLogger.error(
            `[REGION USER NOTICE] Notification non envoyee (userId: ${newUser.id})`,
            { error }
          )
        );
    }
  }

  public async softDelete(
    user: UserAdminAuthenticated,
    uuid: string,
    motif: UserDeleteMotif
  ): Promise<void> {
    const target = await userSupervisorRepository.findOneBy({
      uuid,
      role: In([...REGION_MANAGED_ROLES]),
      status: Not("DELETE"),
    });

    const scope =
      target?.role === "region"
        ? this.getManagedRegions(user)
        : this.getManagedDepartments(user);
    if (!target || !this.isManaged(target.territories, scope)) {
      throw new NotFoundException("USER_NOT_FOUND");
    }

    if (target.id === user._userId) {
      throw new ForbiddenException("CANNOT_DELETE_SELF");
    }

    await this.userSupervisorDecisionService.softDelete({
      targetUserId: target.id,
      targetUserEmail: target.email,
      targetUserRole: target.role,
      motif,
      admin: user,
    });
  }

  private checkDepartmentTerritory(
    user: UserAdminAuthenticated,
    dto: RegisterRegionUserDto
  ): string {
    const department = dto.department ?? "";
    if (!this.getManagedDepartments(user).includes(department)) {
      throw new ForbiddenException("DEPARTMENT_OUTSIDE_REGION");
    }

    // Departments without a verified DDETS domain stay managed by DomiFa
    if (!isDdetsSelfServiceDepartment(department)) {
      throw new ForbiddenException("DEPARTMENT_NOT_SELF_SERVICE");
    }

    if (!isDdetsEmailForDepartment(dto.email, department)) {
      throw new BadRequestException("EMAIL_DOMAIN_MISMATCH");
    }
    return department;
  }

  // The new account gets exactly one region, taken from the creator's own ones
  private checkRegionTerritory(
    user: UserAdminAuthenticated,
    dto: RegisterRegionUserDto
  ): string {
    const region = dto.region ?? "";
    if (!this.getManagedRegions(user).includes(region)) {
      throw new ForbiddenException("REGION_OUTSIDE_SCOPE");
    }

    if (!isDreetsSelfServiceRegion(region)) {
      throw new ForbiddenException("REGION_NOT_SELF_SERVICE");
    }

    if (!isDreetsEmailForRegion(dto.email, region)) {
      throw new BadRequestException("EMAIL_DOMAIN_MISMATCH");
    }
    return region;
  }

  // An account is managed by the DREETS only if every territory it covers
  // belongs to the DREETS scope (its departments or its regions).
  private isManaged(territories: string[], scope: string[]): boolean {
    return (
      territories?.length > 0 &&
      territories.every((code) => scope.includes(code))
    );
  }
}
