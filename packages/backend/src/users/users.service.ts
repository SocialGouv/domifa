import * as bcrypt from "bcrypt";

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
    createdUser.id = this.lastId(await this.findLast());
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
        email: email
      })
      .lean()
      .exec();
  }

  public async findById(id: number): Promise<User> {
    return this.userModel
      .findOne({
        id: id
      })
      .populate("structure")
      .lean()
      .exec();
  }

  public async deleteById(id: number): Promise<User> {
    return this.userModel
      .findOneAndDelete({
        id: id
      })
      .exec();
  }

  private async findLast(): Promise<User> {
    return this.userModel
      .findOne()
      .select("id")
      .sort({ id: -1 })
      .limit(1)
      .lean()
      .exec();
  }

  private lastId(user: User): number {
    if (user) {
      if (user.id !== undefined) {
        return user.id + 1;
      }
    }
    return 1;
  }
}
