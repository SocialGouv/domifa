import { Model } from "mongoose";
import { StructuresService } from '../structures/structures.service';
import { UserDto } from './user.dto';
import { User } from './user.interface';
export declare class UsersService {
    private readonly userModel;
    private readonly structureService;
    constructor(userModel: Model<User>, structureService: StructuresService);
    findAll(): Promise<User[]>;
    newUser(userDto: UserDto): Promise<User>;
    findByEmail(email: string): Promise<User>;
    findById(id: number): Promise<User>;
    private findLast;
    private lastId;
}
