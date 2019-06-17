import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req
} from "@nestjs/common";
import { Request } from "express";
import { UserDto } from "./user.dto";
import { User } from "./user.interface";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  public async create(@Body() userDto: UserDto) {
    return this.usersService.newUser(userDto);
  }

  @Get()
  public findAll(@Req() request: Request): Promise<User[]> {
    return this.usersService.findAll();
    // return 'This action returns all USERS';
  }

  @Delete(":id")
  public deleteOne(@Param("id") id: number) {
    return this.usersService.deleteById(id);
  }
}
