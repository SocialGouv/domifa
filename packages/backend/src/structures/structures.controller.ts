import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post
} from "@nestjs/common";
import * as fs from "fs";
import { MailerService } from "../users/services/mailer.service";
import { UsersService } from "../users/services/users.service";
import { StructureDto } from "./structure-dto";
import { Structure } from "./structure-interface";
import { StructuresService } from "./structures.service";

@Controller("structures")
export class StructuresController {
  constructor(
    private readonly structureService: StructuresService,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService
  ) {}

  @Post()
  public async postStructure(@Body() structureDto: StructureDto) {
    return this.structureService.create(structureDto);
  }

  @Get(":id")
  public async getStructure(@Param("id") id: number) {
    return this.structureService.findById(id);
  }

  @Get("code-postal/:codePostal")
  public async getByCity(@Param("codePostal") codePostal: string) {
    return this.structureService.findAll(codePostal);
  }

  @Get()
  public async getAllStructures() {
    return this.structureService.findAll();
  }

  @Delete(":token")
  public async deleteOne(@Param("token") token: string) {
    return this.structureService.delete(token);
  }

  @Get("confirm/:token")
  public async confim(@Param("token") token: string): Promise<any> {
    if (token === "") {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    const structure = await this.structureService.checkToken(token);

    if (!structure || structure === null) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    } else {
      const admin = await this.usersService.findOne({
        role: "admin",
        structureId: structure.id
      });

      const updatedAdmin = await this.usersService.update(
        admin.id,
        structure.id,
        {
          verified: true
        }
      );

      this.mailerService.confirmationStructure(structure, updatedAdmin);
      return structure;
    }
  }
}
