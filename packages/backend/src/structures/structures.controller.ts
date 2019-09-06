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
import { MailerService } from "../users/mailer.service";
import { UsersService } from "../users/users.service";
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

  /* FORMULAIRE INFOS */
  @Post()
  public postStructure(@Body() structureDto: StructureDto) {
    return this.structureService.create(structureDto);
  }

  @Get(":id")
  public getStructure(@Param("id") id: number): Promise<Structure> {
    return this.structureService.findById(id);
  }

  @Get()
  public getAllStructures(): Promise<Structure> {
    return this.structureService.findAll();
  }

  @Delete(":id")
  public deleteOne(@Param("id") id: number) {
    return this.structureService.deleteById(id);
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
      const admin = await this.usersService.findOneBy({
        role: "admin"
      });

      const updatedAdmin = await this.usersService.updateOne(admin.id, {
        role: "admin",
        verified: true
      });

      this.mailerService.confirmationStructure(structure, updatedAdmin);
      return structure;
    }
  }
}
