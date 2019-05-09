import { Inject, Injectable } from '@nestjs/common';
import { Model } from "mongoose";

import { StructuresService } from '../structures/structures.service';
import { UserDto } from './user.dto';
import { User } from './user.interface';

@Injectable()
export class UsersService {
  constructor(@Inject('USER_MODEL') private readonly userModel: Model<User>,
  private readonly structureService: StructuresService) {
  }

  public async findAll(): Promise<User[]> {
    return  this.userModel.find().lean().exec();
  }

  public async newUser(userDto: UserDto): Promise<User> {
    const createdUser = new this.userModel(userDto);
    createdUser.structure = await this.structureService.findById(createdUser.structureID);
    createdUser.id = this.lastId(await this.findLast());
    return createdUser.save();
  }

  public async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({
      'email' : email
    }).lean().exec();
  }

  public async findById(id: number): Promise<User> {
    return this.userModel.findOne({
      'id': id
    }).populate('structure').lean().exec();
  }

  private async findLast(): Promise<User> {
    return this.userModel.findOne().select('id').sort({ id: -1 }).limit(1).lean().exec();
  }

  private lastId(user): number{
    if (user) {
      if (user.id !== undefined) {
        return user.id + 1;
      }
    }
    return 1;
  }

}


