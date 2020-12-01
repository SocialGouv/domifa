import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { Repository } from "typeorm";
import {
  appTypeormManager,
  AppUserForAdminEmailWithTempTokens,
  AppUserTable,
  usersRepository,
  USERS_ADMIN_EMAILS_ATTRIBUTES,
} from "../../database";
import { Structure } from "../../structures/structure-interface";
import { AppUser } from "../../_common/model";
import { EditPasswordDto } from "../dto/edit-password.dto";
import { RegisterUserAdminDto } from "../dto/register-user-admin.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { UserDto } from "../dto/user.dto";

@Injectable()
export class UsersService {
  private appUserRepository: Repository<AppUserTable>;

  constructor() {
    this.appUserRepository = appTypeormManager.getRepository(AppUserTable);
  }

  public async create(
    userDto: UserDto,
    structure: Structure
  ): Promise<AppUserTable> {
    const createdUser = new AppUserTable(userDto);

    /* Admin par défaut */
    const adminExist = await usersRepository.findOne({
      structureId: userDto.structureId,
    });

    if (!adminExist || adminExist === null) {
      createdUser.role = "admin";
    }

    createdUser.structureId = structure.id;
    createdUser.password = await bcrypt.hash(createdUser.password, 10);

    return this.appUserRepository.save(createdUser);
  }

  public async generateTokenPassword(email: string) {
    const twoDays = new Date();
    twoDays.setDate(twoDays.getDate() + 2);

    return usersRepository.updateOne<AppUserForAdminEmailWithTempTokens>(
      { email },
      {
        temporaryTokens: {
          password: crypto.randomBytes(30).toString("hex"),
          passwordValidity: twoDays,
        },
      },
      {
        select: USERS_ADMIN_EMAILS_ATTRIBUTES.concat("temporaryTokens"),
      }
    );
  }

  public async updatePassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<any> {
    const newPassword = await bcrypt.hash(resetPasswordDto.password, 10);

    const user = await usersRepository.findOneByTokenAttribute(
      "password",
      resetPasswordDto.token
    );

    return usersRepository.updateOne(
      {
        id: user.id,
      },
      {
        password: newPassword,
        passwordLastUpdate: new Date(),
        temporaryTokens: null,
      }
    );
  }

  public async editPassword(
    user: Pick<AppUser, "id">,
    resetPasswordDto: EditPasswordDto
  ): Promise<any> {
    const newPassword = await bcrypt.hash(resetPasswordDto.password, 10);

    return usersRepository.updateOne(
      {
        id: user.id,
      },
      {
        password: newPassword,
        passwordLastUpdate: new Date(),
        temporaryTokens: null,
      }
    );
  }

  public async register(userDto: RegisterUserAdminDto) {
    const createdUser = new AppUserTable(userDto);

    createdUser.verified = true;
    createdUser.password = crypto.randomBytes(30).toString("hex");
    createdUser.temporaryTokens = {
      creation: crypto.randomBytes(30).toString("hex"),
    };

    return appTypeormManager.getRepository(AppUserTable).save(createdUser);
  }

  public async createPassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<any> {
    const newPassword = await bcrypt.hash(resetPasswordDto.password, 10);

    const user = await usersRepository.findOneByTokenAttribute(
      "creation",
      resetPasswordDto.token
    );

    return usersRepository.updateOne(
      {
        id: user.id,
      },
      {
        password: newPassword,
        verified: true,
        temporaryTokens: null,
      }
    );
  }
}
