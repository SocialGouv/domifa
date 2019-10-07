import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";
import { RolesGuard } from "../../auth/roles.guard";
import { CurrentUser } from "../../users/current-user.decorator";
import { User } from "../../users/user.interface";
import { UsersService } from "../../users/users.service";
import { DecisionDto } from "../dto/decision.dto";
import { EntretienDto } from "../dto/entretien";
import { RdvDto } from "../dto/rdv";
import { SearchDto } from "../dto/search";
import { UsagersDto } from "../dto/usagers.dto";
import { CerfaService } from "../services/cerfa.service";
import { DocumentsService } from "../services/documents.service";
import { UsagersService } from "../services/usagers.service";

@UseGuards(AuthGuard("jwt"))
@Controller("usagers")
export class UsagersController {
  private readonly logger = new Logger(UsagersController.name);
  private user: any;

  constructor(
    private readonly usagersService: UsagersService,
    private readonly usersService: UsersService,
    private readonly docsService: DocumentsService,
    private readonly cerfaService: CerfaService
  ) {}

  /* PROFILE & MANAGEMENT */
  @Get("search")
  public search(@Query() query: SearchDto, @CurrentUser() user: User) {
    return this.usagersService.search(query, user.structureId);
  }

  /* FORMULAIRE INFOS */
  @Post()
  public postUsager(@Body() usagerDto: UsagersDto, @CurrentUser() user: User) {
    return this.usagersService.create(usagerDto, user);
  }

  @Patch()
  public async patchUsager(
    @Body() usagerDto: UsagersDto,
    @CurrentUser() user: User
  ) {
    return this.usagersService.patch(usagerDto, user);
  }

  /* RDV  */
  @Post("rdv/:id")
  public async postRdv(
    @Param("id") usagerId: number,
    @Body() rdvDto: RdvDto,
    @CurrentUser() currentUser: User
  ) {
    const user = await this.usersService.findOne({
      id: rdvDto.userId,
      structureId: currentUser.structureId
    });

    const usager = await this.usagersService.findById(
      usagerId,
      currentUser.structureId
    );

    if (!user || !usager) {
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_GATEWAY);
    }

    return this.usagersService.setRdv(usagerId, rdvDto, user);
  }

  /* RDV  */
  @Post("entretien/:id")
  public setEntretien(
    @Param("id") usagerId: number,
    @Body() entretien: EntretienDto,
    @CurrentUser() user: User
  ) {
    return this.usagersService.setEntretien(usagerId, entretien, user);
  }

  /* RDV  */
  @UseGuards(RolesGuard)
  @Post("decision/:id")
  public async setDecision(
    @Param("id") usagerId: number,
    @Body() decisionDto: DecisionDto,
    @CurrentUser() user: User
  ) {
    const usager = await this.usagersService.findById(
      usagerId,
      user.structureId
    );
    if (!user || !usager || usager === null) {
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    return this.usagersService.setDecision(usager, decisionDto, user);
  }

  /* DOUBLON */
  @Get("doublon/:nom/:prenom")
  public isDoublon(
    @Param("nom") nom: string,
    @Param("prenom") prenom: string,
    @CurrentUser() user: User
  ) {
    return this.usagersService.isDoublon(nom, prenom, user);
  }

  @Get(":id")
  public async findOne(
    @Param("id") usagerId: number,
    @CurrentUser() user: User
  ) {
    const usager = await this.usagersService.findById(
      usagerId,
      user.structureId
    );
    if (usager === null) {
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.NOT_FOUND);
    }
    return usager;
  }

  @Delete(":id")
  public async deleteOne(
    @Param("id") usagerId: number,
    @CurrentUser() user: User
  ) {
    return this.usagersService.delete(usagerId, user);
  }

  @Get("attestation/:id")
  public async getAttestation(
    @Param("id") usagerId: number,
    @Res() res: any,
    @CurrentUser() user: User
  ) {
    const usager = await this.usagersService.findById(
      usagerId,
      user.structureId
    );
    if (!user || !usager || usager === null) {
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
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
    @Param("index") index: number,
    @CurrentUser() user: User
  ) {
    return this.docsService.deleteDocument(usagerId, index, user);
  }

  @Get("document/:usagerId/:index")
  public async getDocument(
    @Param("usagerId") usagerId: number,
    @Param("index") index: number,
    @Res() res: any,
    @CurrentUser() user: User
  ) {
    const usager = await this.usagersService.findById(
      usagerId,
      user.structureId,
      "docsPath"
    );

    const fileInfos = await this.docsService.getDocument(usager, index);
    if (fileInfos === null) {
      throw new HttpException("BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    const pathFile = path.resolve(
      __dirname,
      "../../uploads/" +
        usager.structureId +
        "/" +
        usager.id +
        "/" +
        fileInfos.path
    );

    if (!fs.existsSync(pathFile)) {
      throw new HttpException("FILE_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    res.sendFile(pathFile);
  }

  @Post("document/:usagerId")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = path.resolve(
            __dirname,
            "../../uploads/" + req.user.structureId + "/" + req.params.usagerId
          );
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
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
    @Body() postData,
    @CurrentUser() user: User
  ) {
    const userName = user.prenom + " " + user.nom;

    const newDoc = {
      createdAt: new Date(),
      createdBy: userName,
      filetype: file.mimetype,
      label: postData.label
    };
    return this.docsService.addDocument(usagerId, file.filename, newDoc);
  }
}
