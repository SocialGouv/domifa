import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger
} from "@nestjs/common";
import { Model } from "mongoose";

import { Structure } from "../structures/structure-interface";
import { StructuresService } from "../structures/structures.service";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { MailerService } from "./mailer.service";
import { UserDto } from "./user.dto";
import { User } from "./user.interface";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject("USER_MODEL") private readonly userModel: Model<User>,
    private readonly structureService: StructuresService,
    private readonly mailerService: MailerService
  ) {}

  public async findAll(): Promise<User[]> {
    return this.userModel
      .find()
      .lean()
      .exec();
  }

  public async create(userDto: UserDto, structure: Structure): Promise<User> {
    const createdUser = new this.userModel(userDto);

    // ADMIN PAR DEFAUT
    const adminExist = await this.findOneBy({
      structureId: userDto.structureId
    });

    if (!adminExist || adminExist === null) {
      createdUser.role = "admin";
    }

    createdUser.structure = structure;
    createdUser.id = await this.findLast();
    createdUser.password = await bcrypt.hash(createdUser.password, 10);

    return createdUser.save();
  }

  public async findByEmail(email: string): Promise<User> {
    return this.userModel
      .findOne({
        email
      })
      .lean()
      .exec();
  }

  public async findOneBy(search: any): Promise<User> {
    return this.userModel
      .findOne(search)
      .lean()
      .exec();
  }

  public async findByStructure(id: number): Promise<User> {
    return this.userModel
      .find({
        structureId: id
      })
      .select({ nom: 1, prenom: 1, email: 1, id: 1 })
      .lean()
      .exec();
  }

  public async updateOne(userId: number, data: any): Promise<User> {
    return this.userModel
      .findOneAndUpdate(
        {
          id: userId
        },
        {
          $set: data
        },
        {
          new: true
        }
      )
      .select("-password")
      .exec();
  }

  public async generateTokenPassword(email: string): Promise<User> {
    const d = new Date();
    const twoDays = d.setDate(d.getDate() + 2);
    return this.userModel
      .findOneAndUpdate(
        { email },
        {
          $set: {
            tokens: {
              password: crypto.randomBytes(30).toString("hex"),
              passwordValidity: twoDays
            }
          }
        },
        {
          new: true
        }
      )
      .select("-password")
      .exec();
  }

  public async updatePassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<any> {
    return this.userModel
      .findOneAndUpdate(
        { token: resetPasswordDto.token },
        {
          $set: {
            password: await bcrypt.hash(resetPasswordDto.password, 10)
          }
        },
        {
          new: true
        }
      )
      .select("-password")
      .select("-tokens")
      .exec();
  }

  public async findById(id: number): Promise<User> {
    return this.userModel
      .findOne({
        id
      })
      .populate("structure")
      .lean()
      .exec();
  }

  public async deleteById(id: number): Promise<User> {
    return this.userModel
      .findOneAndDelete({
        id
      })
      .exec();
  }

  public async findLast(): Promise<number> {
    try {
      const lastUser = await this.userModel
        .findOne({}, { id: 1 })
        .sort({ id: -1 })
        .lean()
        .exec();
      return lastUser.id === undefined ? 1 : lastUser.id + 1;
    } catch (e) {
      return 1;
    }
  }
}
