import * as bcrypt from "bcryptjs";

import {
  BadRequestException,
  Inject,
  Injectable,
  Logger
} from "@nestjs/common";
import { Model } from "mongoose";

import { StructuresService } from "../structures/structures.service";
import { UserDto } from "./user.dto";
import { User } from "./user.interface";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject("USER_MODEL") private readonly userModel: Model<User>,
    private readonly structureService: StructuresService
  ) {}

  public async findAll(): Promise<User[]> {
    return this.userModel
      .find()
      .lean()
      .exec();
  }

  public async newUser(userDto: UserDto): Promise<User> {
    const createdUser = new this.userModel(userDto);
    const structure = await this.structureService.findById(
      createdUser.structureId
    );
    createdUser.structure = structure;
    createdUser.id = await this.findLast();
    createdUser.password = await bcrypt.hash(createdUser.password, 10);

    try {
      const newUser = await createdUser.save();
      this.structureService.addUser(newUser, createdUser.structureId);

      return newUser;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async findByEmail(email: string): Promise<User> {
    return this.userModel
      .findOne({
        email
      })
      .lean()
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
    const lastUser = await this.userModel
      .findOne({}, { id: 1 })
      .sort({ id: -1 })
      .lean()
      .exec();
    return lastUser.id !== undefined ? lastUser.id + 1 : 1;
  }
}
