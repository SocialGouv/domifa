import { Inject, Injectable, Logger } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { Model } from "mongoose";
import { Structure } from "../../structures/structure-interface";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { UserDto } from "../user.dto";
import { User } from "../user.interface";

@Injectable()
export class UsersService {
  constructor(@Inject("USER_MODEL") private readonly userModel: Model<User>) {}

  public async findAll(user: User): Promise<any> {
    return this.userModel
      .find({
        structureId: user.structureId
      })
      .lean()
      .exec();
  }

  public async create(userDto: UserDto, structure: Structure): Promise<User> {
    const createdUser = new this.userModel(userDto);

    // ADMIN PAR DEFAUT
    const adminExist = await this.findOne({
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

  public async findOne(search: any): Promise<any> {
    return this.userModel
      .findOne(search)
      .populate("structure")
      .lean()
      .exec();
  }

  public async update(
    userId: number,
    structureId: number,
    data: any
  ): Promise<User> {
    return this.userModel
      .findOneAndUpdate(
        {
          id: userId,
          structureId
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
    const newPassword = await bcrypt.hash(resetPasswordDto.password, 10);

    return this.userModel
      .findOneAndUpdate(
        { "tokens.password": resetPasswordDto.token },
        {
          $set: {
            password: newPassword
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

  public async delete(id: number, structureId: number): Promise<any> {
    return this.userModel
      .findOneAndRemove({
        id,
        structureId
      })
      .exec();
  }

  public async findLast(): Promise<number> {
    const lastUser: any = await this.userModel
      .findOne({}, { id: 1 })
      .sort({ id: -1 })
      .lean()
      .exec();

    return lastUser === {} || lastUser === null ? 1 : lastUser.id + 1;
  }
}
