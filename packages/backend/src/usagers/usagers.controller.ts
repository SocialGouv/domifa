import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";
import { RolesGuard } from "../auth/roles.guard";
import { User } from "../users/user.interface";
import { UsersService } from "../users/users.service";
import { EntretienDto } from "./dto/entretien";
import { RdvDto } from "./dto/rdv";
import { SearchDto } from "./dto/search";
import { UsagersDto } from "./dto/usagers.dto";
import { Decision } from "./interfaces/decision";
import { CerfaService } from "./services/cerfa.service";
import { UsagersService } from "./services/usagers.service";

@UseGuards(AuthGuard("jwt"))
@Controller("usagers")
export class UsagersController {
  private readonly logger = new Logger(UsagersController.name);
  private user: any;

  constructor(
    private readonly usagersService: UsagersService,
    private readonly usersService: UsersService,
    private readonly cerfaService: CerfaService,
    @Inject(REQUEST) private readonly request: any
  ) {}

  /* PROFILE & MANAGEMENT */
  @Get("search")
  public search(@Query() query: SearchDto) {
    return this.usagersService.search(query, this.request.user.structureId);
  }

  /* FORMULAIRE INFOS */
  @Post()
  public postUsager(@Body() usagerDto: UsagersDto) {
    usagerDto.decision.userInstructionName =
      this.request.user.prenom + " " + this.request.user.nom;
    usagerDto.decision.userInstructionId = this.request.user.id;
    usagerDto.structureId = this.request.user.structureId;

    return this.usagersService.create(usagerDto);
  }

  @Patch()
  public async patchUsager(@Body() usagerDto: UsagersDto) {
    const usager = await this.usagersService.findById(usagerDto.id);
    if (!usager) {
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_GATEWAY);
    }
    return this.usagersService.patch(usagerDto);
  }

  /* RDV  */
  @Post("rdv/:id")
  public async postRdv(@Param("id") usagerId: number, @Body() rdvDto: RdvDto) {
    const usager = await this.usagersService.findById(usagerId);
    const user = await this.usersService.findById(rdvDto.userId);

    if (!user || !usager) {
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_GATEWAY);
    }

    return this.usagersService.setRdv(usagerId, rdvDto, user);
  }

  /* RDV  */
  @Post("entretien/:id")
  public setEntretien(
    @Param("id") usagerId: number,
    @Body() entretien: EntretienDto
  ) {
    return this.usagersService.setEntretien(usagerId, entretien);
  }

  /* RDV  */
  @UseGuards(RolesGuard)
  @Post("decision/:id")
  public setDecision(
    @Param("id") usagerId: number,
    @Body() decision: Decision
  ) {
    return this.usagersService.setDecision(usagerId, decision);
  }

  /* DOUBLON */
  @Get("doublon/:nom/:prenom")
  public isDoublon(@Param("nom") nom: string, @Param("prenom") prenom: string) {
    return this.usagersService.isDoublon(nom, prenom);
  }

  @Get(":id")
  public async findOne(@Param("id") usagerId: number) {
    const usager = await this.usagersService.findById(usagerId);
    if (usager === null) {
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.NOT_FOUND);
    }
    return usager;
  }

  @Delete(":id")
  public deleteOne(@Param("id") usagerId: number) {
    return this.usagersService.deleteById(usagerId);
  }

  @Get("attestation/:id")
  public async getAttestation(@Param("id") usagerId: number, @Res() res) {
    const usager = await this.usagersService.findById(usagerId);
    const user = await this.usersService.findById(2);

    if (!user || !usager || usager === null) {
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.NOT_FOUND);
    }

    this.cerfaService
      .attestation(usager, user)
      .then(buffer => {
        this.logger.log("BUFFER");
        res.setHeader("content-type", "application/pdf");
        res.send(buffer);
      })
      .catch(err => {
        this.logger.log("Erreur Cerfa ");
        this.logger.log(err);
        throw new HttpException("CERFA_ERROR", HttpStatus.BAD_REQUEST);
      });
  }

  /* DOCUMENT */
  @Delete("document/:usagerId/:index")
  public async deleteDocument(
    @Param("usagerId") usagerId: number,
    @Param("index") index: number
  ) {
    return this.usagersService.deleteDocument(usagerId, index);
  }

  @Get("document/:usagerId/:index")
  public async getDocument(
    @Param("usagerId") usagerId: number,
    @Param("index") index: number,
    @Res() res: any
  ) {
    const fileInfos = await this.usagersService.getDocument(usagerId, index);

    if (fileInfos === null) {
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.NOT_FOUND);
    }

    const pathFile = path.resolve(__dirname, "../../uploads/" + fileInfos.path);

    if (!fs.existsSync(pathFile)) {
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.NOT_FOUND);
    }

    res.sendFile(pathFile);
  }

  @Post("document/:usagerId")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: path.resolve(__dirname, "../../uploads"),
        fileFilter: (req: any, file: any, cb: any) => {
          const mimeTest = !file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/);
          const sizeTest = file.size >= 5242880;
          if (sizeTest || mimeTest) {
            throw new BadRequestException({
              fileSize: sizeTest,
              fileType: mimeTest
            });
          }
          cb(null, true);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${path.extname(file.originalname)}`);
        }
      })
    })
  )
  public uploadDoc(
    @Param("usagerId") usagerId: number,
    @UploadedFile() file: any,
    @Body() postData
  ) {
    const userName = this.request.user.prenom + " " + this.request.user.nom;

    const newDoc = {
      createdAt: new Date(),
      createdBy: userName,
      filetype: file.mimetype,
      label: postData.label
    };
    return this.usagersService.addDocument(usagerId, file.filename, newDoc);
  }
}
