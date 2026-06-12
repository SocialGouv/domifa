import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { buildSecurityLogRequestContext } from "../../../../util/express";
import { OtpGuard } from "../../../otp/guards/otp.guard";
import { RequireOtp } from "../../../otp/decorators/require-otp.decorator";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UserAdminAuthenticated } from "../../../../_common/model";
import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
} from "../../../../auth/decorators";
import { AppUserGuard } from "../../../../auth/guards";
import { appLogger, ExpressResponse } from "../../../../util";
import { UsersController } from "../../../users/controllers/users.controller";

import { AppLogsService } from "../../../app-logs/app-logs.service";
import { AppLogSecurityService } from "../../../app-logs/app-log-security.service";
import { buildSupervisorActorFields } from "../../../app-logs/app-logs.helpers";
import {
  BrevoBlockedContact,
  BrevoContactStatus,
  BrevoEmailEvent,
  UserSupervisor,
  UsersForAdminList,
} from "@domifa/common";
import {
  userStructureRepository,
  userSupervisorRepository,
} from "../../../../database";

import {
  BrevoEmailEventsQueryDto,
  RegisterUserStructureAdminDto,
  RegisterUserSupervisorDto,
  UnblockUserDto,
} from "../../dto";
import { DeleteUserDto } from "../../../users/dto";
import { UserStructureDecisionService } from "../../../users/services/user-structure-decision/user-structure-decision.service";
import { UserSupervisorDecisionService } from "../../services/user-supervisor-decision/user-supervisor-decision.service";
import { PageOptionsDto } from "../../../../usagers/dto/pagination/page-options.dto";
import { AdminStructuresService } from "../../services";
import { AdminSuperivorUsersService } from "../../services/admin-superivor-users/admin-superivor-users.service";
import { PatchUserSupervisorDto } from "../../dto/patch-user-supervisor.dto";
import { ElevateUserRoleDto } from "../../dto/elevate-user-role.dto";
import {
  UserSupervisorCrudLogContext,
  AdminUserRoleChangeLogContext,
  BlockUserByAdminLogContext,
} from "../../../app-logs/types/app-log-context.types";
import { CurrentSupervisor } from "../../../../auth/decorators/current-supervisor.decorator";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";

@UseGuards(AuthGuard("jwt"), AppUserGuard)
@ApiTags("dashboard")
@AllowUserProfiles("supervisor")
@AllowUserSupervisorRoles("super-admin-domifa")
@ApiBearerAuth()
@Controller("admin/users")
export class AdminUsersController {
  constructor(
    private readonly appLogsService: AppLogsService,
    private readonly appLogSecurityService: AppLogSecurityService,
    private readonly adminSuperivorUsersService: AdminSuperivorUsersService,
    private readonly adminStructuresService: AdminStructuresService,
    private readonly brevoSenderService: BrevoSenderService,
    private readonly userStructureDecisionService: UserStructureDecisionService,
    private readonly userSupervisorDecisionService: UserSupervisorDecisionService
  ) {}

  @Post("register-user-structure")
  public async registerUserStructureAdmin(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() res: ExpressResponse,
    @Body() registerUserDto: RegisterUserStructureAdminDto
  ): Promise<ExpressResponse> {
    const userController = new UsersController(
      this.appLogsService,
      this.brevoSenderService,
      this.userStructureDecisionService
    );
    await this.appLogsService.create({
      ...buildSupervisorActorFields(user),
      action: "ADMIN_CREATE_USER_STRUCTURE",
    });
    return await userController.registerUser(user, res, registerUserDto);
  }

  @Patch("elevate-user-role")
  public async elevateUserRoleToAdmin(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() res: ExpressResponse,
    @Body() elevateRoleDto: ElevateUserRoleDto
  ): Promise<ExpressResponse> {
    const { uuid } = elevateRoleDto;
    try {
      const userToElevate = await userStructureRepository.findOneByOrFail({
        uuid,
      });

      if (userToElevate.role === "admin") {
        throw new Error("User is already and admin");
      }

      await userStructureRepository.update(
        {
          uuid: userToElevate.uuid,
        },
        {
          role: "admin",
        }
      );
      await this.appLogsService.create<AdminUserRoleChangeLogContext>({
        ...buildSupervisorActorFields(user),
        action: "ADMIN_ELEVATE_ROLE_USER_SUPERVISOR",
      });

      return res.status(HttpStatus.OK).send({
        message: "OK",
      });
    } catch (e) {
      appLogger.error(e);
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: "UNABLE_TO_ELEVATE_USER_ROLE",
      });
    }
  }

  @Post("register-user-supervisor")
  public async registerNewSupervisor(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() res: ExpressResponse,
    @Body() registerUserDto: RegisterUserSupervisorDto
  ): Promise<ExpressResponse> {
    const userExist = await userSupervisorRepository.findOneBy({
      email: registerUserDto.email.toLowerCase(),
    });

    if (userExist) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "BAD_REQUEST" });
    }

    const { user: newUser, userSecurity } =
      await this.adminSuperivorUsersService.createUserWithTmpToken(
        registerUserDto
      );

    if (!newUser) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "REGISTER_ERROR" });
    }

    await this.brevoSenderService.sendUserActivationEmail({
      userId: newUser.id,
      userProfile: "supervisor",
      userSecurity,
    });

    await this.appLogsService.create<UserSupervisorCrudLogContext>({
      ...buildSupervisorActorFields(user),
      action: "ADMIN_USER_CREATE",
      context: {
        userId: newUser.id,
        role: registerUserDto.role,
      },
    });

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: "Liste des utilisateurs des structures (vue super-admin)",
  })
  @Get("structure-users")
  public async getStructureUsers(): Promise<UsersForAdminList[]> {
    return this.adminStructuresService.getUsersForAdmin();
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Compte les contacts Brevo bloqués (campagnes + transactionnel). Lecture seule.",
  })
  @Get("brevo/blocked-counts")
  public async getBrevoBlockedCounts(): Promise<{
    campaignBlocked: number | null;
    transactionalBlocked: number | null;
  }> {
    const [campaignBlocked, transactionalBlocked] = await Promise.all([
      this.brevoSenderService.countCampaignBlacklisted(),
      this.brevoSenderService.countTransactionalBlocked(),
    ]);
    return { campaignBlocked, transactionalBlocked };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Liste paginée des contacts Brevo bloqués transactionnellement (hard bounces, plaintes spam).",
  })
  @Get("brevo/blocked-contacts")
  public async getBrevoBlockedContacts(
    @Query() pageOptions: PageOptionsDto
  ): Promise<{ data: BrevoBlockedContact[]; total: number | null }> {
    const take = pageOptions.take ?? 50;
    const skip = ((pageOptions.page ?? 1) - 1) * take;
    const [data, total] = await Promise.all([
      this.brevoSenderService.listTransactionalBlockedContacts(skip, take),
      this.brevoSenderService.countTransactionalBlocked(),
    ]);
    return { data, total };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Résout l'URL de fiche Brevo d'un contact à partir de son email (pour deep-link admin).",
  })
  @Get("brevo/contact-link")
  public async getBrevoContactLink(
    @Query("email") email: string
  ): Promise<{ url: string | null }> {
    if (typeof email !== "string" || !email.includes("@")) {
      throw new BadRequestException("INVALID_EMAIL");
    }
    const status = await this.brevoSenderService.getContactStatus({ email });
    if (!status.existsInBrevo || !status.id) {
      return { url: null };
    }
    return { url: `https://app.brevo.com/contact/index/${status.id}` };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Débloque un email de la blocklist transactionnelle Brevo (utilisé par la page d'administration).",
  })
  @Delete("brevo/blocked-contacts/:email")
  public async unblockBrevoBlockedContact(
    @Req() req: ExpressRequest,
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Param("email") email: string,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    if (!email || !email.includes("@")) {
      throw new BadRequestException("INVALID_EMAIL");
    }
    await this.brevoSenderService.unblockBrevoTransactional({ email });
    try {
      const requestContext = buildSecurityLogRequestContext(req);
      await this.appLogSecurityService.create({
        userType: "anonymous",
        action: "UNBLOCK_BREVO_CONTACT",
        ip: requestContext.ip,
        userAgent: requestContext.userAgent,
        context: {
          email,
          kind: "transactional",
          source: "brevo-blocklist-admin-page",
          actorSupervisorId: user.id,
          actorRole: user.role,
        },
      });
    } catch {
      // Best-effort audit.
    }
    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Débloquer un utilisateur supervisor (OTP requis)" })
  @Patch("supervisor/:uuid/unblock")
  @UseGuards(OtpGuard)
  @RequireOtp("UNBLOCK_USER")
  public async unblockSupervisorUser(
    @Req() req: ExpressRequest,
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() unblockDto: UnblockUserDto,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    const requestContext = buildSecurityLogRequestContext(req);
    const { userId } =
      await this.adminSuperivorUsersService.unblockSupervisorUser(
        uuid,
        requestContext
      );

    try {
      await this.appLogSecurityService.create({
        // SUBJECT = target user.
        userSupervisorId: userId,
        userType: "user_supervisor",
        action: "UNBLOCK_USER",
        ip: requestContext.ip,
        userAgent: requestContext.userAgent,
        context: {
          motif: unblockDto.motif,
          actorSupervisorId: user.id,
          actorRole: user.role,
        },
      });
    } catch {
      // Best-effort audit: the unblock has already committed above.
    }

    return res.status(HttpStatus.OK).json({ status: "ACTIVE" });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Logs d'activité d'un utilisateur supervisor" })
  @Get("supervisor/:uuid/logs")
  public async getSupervisorUserLogs(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Query() pageOptions: PageOptionsDto
  ) {
    const target = await userSupervisorRepository.findOne({
      where: { uuid },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }
    return this.appLogsService.findUserLogs({
      userType: "user_supervisor",
      userId: target.id,
      page: pageOptions.page,
      take: pageOptions.take,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: "Logs de sécurité d'un utilisateur supervisor",
  })
  @Get("supervisor/:uuid/security-logs")
  public async getSupervisorSecurityLogs(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Query() pageOptions: PageOptionsDto
  ) {
    const target = await userSupervisorRepository.findOne({
      where: { uuid },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }
    return this.appLogSecurityService.findUserSecurityLogs({
      userType: "user_supervisor",
      userId: target.id,
      page: pageOptions.page,
      take: pageOptions.take,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: "Événements Brevo (logs mailing) d'un utilisateur supervisor",
  })
  @Get("supervisor/:uuid/email-events")
  public async getSupervisorEmailEvents(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Query() query: BrevoEmailEventsQueryDto
  ): Promise<BrevoEmailEvent[]> {
    const target = await userSupervisorRepository.findOne({
      where: { uuid },
      select: { email: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }
    return this.brevoSenderService.getEmailEventsForEmail({
      email: target.email,
      limit: query.limit,
      offset: query.offset,
      event: query.event,
      days: query.days,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Statut Brevo (blocklist transactionnelle) d'un utilisateur supervisor",
  })
  @Get("supervisor/:uuid/brevo/status")
  public async getSupervisorBrevoStatus(
    @Param("uuid", new ParseUUIDPipe()) uuid: string
  ): Promise<BrevoContactStatus> {
    const target = await userSupervisorRepository.findOne({
      where: { uuid },
      select: { email: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }
    return this.brevoSenderService.getContactStatus({ email: target.email });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Débloque le contact d'un superviseur côté Brevo (kind=campaign : flag emailBlacklisted, kind=transactional : blocklist SMTP)",
  })
  @Delete("supervisor/:uuid/brevo/blocklist/:kind")
  public async unblockSupervisorBrevoContact(
    @Req() req: ExpressRequest,
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Param("kind") kind: string,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    const target = await userSupervisorRepository.findOne({
      where: { uuid },
      select: { id: true, email: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }

    await this.runBrevoUnblock(kind, target.email);

    try {
      const requestContext = buildSecurityLogRequestContext(req);
      await this.appLogSecurityService.create({
        userSupervisorId: target.id,
        userType: "user_supervisor",
        action: "UNBLOCK_BREVO_CONTACT",
        ip: requestContext.ip,
        userAgent: requestContext.userAgent,
        context: {
          email: target.email,
          kind,
          actorSupervisorId: user.id,
          actorRole: user.role,
        },
      });
    } catch {
      // Best-effort audit: the Brevo unblock has already committed above.
    }

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Logs d'activité d'un utilisateur de structure" })
  @Get("structure-user/:uuid/logs")
  public async getStructureUserLogs(
    @CurrentSupervisor() _user: UserAdminAuthenticated,
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Query() pageOptions: PageOptionsDto
  ) {
    const target = await userStructureRepository.findOne({
      where: { uuid },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }
    return this.appLogsService.findUserLogs({
      userType: "user_structure",
      userId: target.id,
      page: pageOptions.page,
      take: pageOptions.take,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: "Logs de sécurité d'un utilisateur de structure",
  })
  @Get("structure-user/:uuid/security-logs")
  public async getStructureUserSecurityLogs(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Query() pageOptions: PageOptionsDto
  ) {
    const target = await userStructureRepository.findOne({
      where: { uuid },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }
    return this.appLogSecurityService.findUserSecurityLogs({
      userType: "user_structure",
      userId: target.id,
      page: pageOptions.page,
      take: pageOptions.take,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: "Événements Brevo (logs mailing) d'un utilisateur de structure",
  })
  @Get("structure-user/:uuid/email-events")
  public async getStructureUserEmailEvents(
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Query() query: BrevoEmailEventsQueryDto
  ): Promise<BrevoEmailEvent[]> {
    const target = await userStructureRepository.findOne({
      where: { uuid },
      select: { email: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }
    return this.brevoSenderService.getEmailEventsForEmail({
      email: target.email,
      limit: query.limit,
      offset: query.offset,
      event: query.event,
      days: query.days,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Statut Brevo (blocklist transactionnelle) d'un utilisateur de structure",
  })
  @Get("structure-user/:uuid/brevo/status")
  public async getStructureUserBrevoStatus(
    @Param("uuid", new ParseUUIDPipe()) uuid: string
  ): Promise<BrevoContactStatus> {
    const target = await userStructureRepository.findOne({
      where: { uuid },
      select: { email: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }
    return this.brevoSenderService.getContactStatus({ email: target.email });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Débloque le contact d'un utilisateur de structure côté Brevo (kind=campaign|transactional)",
  })
  @Delete("structure-user/:uuid/brevo/blocklist/:kind")
  public async unblockStructureUserBrevoContact(
    @Req() req: ExpressRequest,
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Param("kind") kind: string,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    const target = await userStructureRepository.findOne({
      where: { uuid },
      select: { id: true, email: true, structureId: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }

    await this.runBrevoUnblock(kind, target.email);

    try {
      const requestContext = buildSecurityLogRequestContext(req);
      await this.appLogSecurityService.create({
        userStructureId: target.id,
        userType: "user_structure",
        structureId: target.structureId,
        action: "UNBLOCK_BREVO_CONTACT",
        ip: requestContext.ip,
        userAgent: requestContext.userAgent,
        context: {
          email: target.email,
          kind,
          actorSupervisorId: user.id,
          actorRole: user.role,
        },
      });
    } catch {
      // Best-effort audit: the Brevo unblock has already committed above.
    }

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  private async runBrevoUnblock(kind: string, email: string): Promise<void> {
    if (kind === "campaign") {
      await this.brevoSenderService.unblockBrevoCampaign({ email });
      return;
    }
    if (kind === "transactional") {
      await this.brevoSenderService.unblockBrevoTransactional({ email });
      return;
    }
    throw new BadRequestException(
      `INVALID_BREVO_BLOCKLIST_KIND: ${kind} (expected "campaign" or "transactional")`
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Bloquer un utilisateur supervisor (OTP requis)" })
  @Patch("supervisor/:uuid/block")
  @UseGuards(OtpGuard)
  @RequireOtp("BLOCK_USER_BY_ADMIN")
  public async blockSupervisorUser(
    @Req() req: ExpressRequest,
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Res() res: ExpressResponse
  ): Promise<ExpressResponse> {
    if (user.uuid === uuid) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_BLOCK_SELF" });
    }

    const previous = await this.adminSuperivorUsersService.blockSupervisorUser(
      uuid
    );

    try {
      const requestContext = buildSecurityLogRequestContext(req);
      await this.appLogSecurityService.create<
        BlockUserByAdminLogContext & {
          actorSupervisorId: number;
          actorRole: string;
        }
      >({
        // SUBJECT = target user.
        userSupervisorId: previous.userId,
        userType: "user_supervisor",
        action: "BLOCK_USER_BY_ADMIN",
        ip: requestContext.ip,
        userAgent: requestContext.userAgent,
        context: {
          previousStatus: previous.previousStatus,
          previousRole: previous.previousRole,
          actorSupervisorId: user.id,
          actorRole: user.role,
        },
      });
    } catch {
      // Best-effort audit: the block has already committed above.
    }

    return res.status(HttpStatus.OK).json({ status: "BLOCKED" });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Liste des utilisateurs superviseurs" })
  @Get("")
  public async getUsersSupervisors(): Promise<UserSupervisor[]> {
    return userSupervisorRepository.find({
      select: {
        nom: true,
        prenom: true,
        id: true,
        role: true,
        email: true,
        lastLogin: true,
        createdAt: true,
        territories: true,
        uuid: true,
        status: true,
      },
    });
  }

  @Patch(":uuid")
  public async patchUserSupervisor(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() res: ExpressResponse,
    @Body() patchUserDto: PatchUserSupervisorDto,
    @Param("uuid", new ParseUUIDPipe()) uuid: string
  ): Promise<ExpressResponse> {
    await this.appLogsService.create({
      ...buildSupervisorActorFields(user),
      action: "ADMIN_PATCH_USER_SUPERVISOR",
    });

    const userExist = await userSupervisorRepository.findOneBy({
      uuid,
    });

    if (!userExist) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_PATCH_USER_SUPERVISOR" });
    }
    await userSupervisorRepository.update({ uuid }, { ...patchUserDto });

    if (userExist.role !== patchUserDto.role) {
      await this.appLogsService.create<AdminUserRoleChangeLogContext>({
        ...buildSupervisorActorFields(user),
        action: "ADMIN_USER_ROLE_CHANGE",
        context: {
          userId: userExist.id,
          newRole: patchUserDto.role,
          oldRole: userExist.role,
        },
      });
    }
    return res.status(HttpStatus.OK).json({ message: "OK" });
  }

  @Delete(":uuid")
  public async deleteUserSupervisor(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Res() res: ExpressResponse,
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() body: DeleteUserDto
  ): Promise<ExpressResponse> {
    const userExist = await userSupervisorRepository.findOneBy({ uuid });

    if (!userExist || userExist.uuid === user.uuid) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "CANNOT_PATCH_USER_SUPERVISOR" });
    }

    await this.userSupervisorDecisionService.softDelete({
      targetUserId: userExist.id,
      targetUserRole: userExist.role,
      motif: body.motif,
      admin: user,
    });

    return res.status(HttpStatus.OK).json({ message: "OK" });
  }
}
