import { Request } from 'express';
import { UserDto } from './user.dto';
import { User } from './user.interface';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(userDto: UserDto): Promise<User>;
    findAll(request: Request): Promise<User[]>;
}
