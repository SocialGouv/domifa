import { BadRequestException, Body, Controller, Delete, Get, Header, HttpException, HttpStatus, Logger, Param, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer';
import * as path from 'path';
import { UsersService } from '../users/users.service';
import { EntretienDto } from './dto/entretien';
import { RdvDto } from './dto/rdv';
import { SearchDto } from './dto/search';
import { UsagersDto } from './dto/usagers.dto';
import { Decision } from './interfaces/decision';
import { CerfaService } from './services/cerfa.service';
import { UsagersService } from './services/usagers.service';

@Controller('usagers')
export class UsagersController {

  private readonly logger = new Logger(UsagersController.name);

  constructor(private readonly usagersService: UsagersService,
    private readonly usersService: UsersService,
    private readonly cerfaService: CerfaService)
    {

    }

    /* FORMULAIRE INFOS */
    @Post()
    public postUsager(@Body() usagerDto: UsagersDto) {
      return this.usagersService.create(usagerDto);
    }

    @Patch()
    public async patchUsager(@Body() usagerDto: UsagersDto) {
      const usager = await this.usagersService.findById(usagerDto.id);
      if (!usager) {
        throw new HttpException('Usager not found', HttpStatus.BAD_GATEWAY);
      }
      return this.usagersService.patch(usagerDto);
    }

    /* RDV  */
    @Post('rdv/:id')
    public async postRdv(@Param('id') usagerId: number, @Body() rdvDto: RdvDto) {
      const usager = await this.usagersService.findById(usagerId);
      const user = await this.usersService.findById(rdvDto.userId);

      if (!user || !usager) {
        throw new HttpException('Usager not found', HttpStatus.BAD_GATEWAY);
      }

      return this.usagersService.setRdv(usagerId, rdvDto, user);
    }

    /* RDV  */
    @Post('entretien/:id')
    public setEntretien(@Param('id') usagerId: number, @Body() entretien: EntretienDto ) {
      return this.usagersService.setEntretien(usagerId, entretien);
    }

    /* RDV  */
    @Post('decision/:id')
    public setDecision(@Param('id') usagerId: number, @Body() decision: Decision) {
      return this.usagersService.setDecision(usagerId, decision);
    }

    /* PROFILE & MANAGEMENT */
    @Get('search')
    public search(@Query() query: SearchDto) {
      return this.usagersService.search(query);
    }

    @Get(':id')
    public findOne(@Param('id') usagerId: number) {
      return this.usagersService.findById(usagerId);
    }

    @Delete(':id')
    public deleteOne(@Param('id') usagerId: number) {
      return this.usagersService.deleteById(usagerId);
    }

    @Get('attestation/:id')
    public async getAttestation(@Param('id') usagerId: number, @Res() res) {

      const usager = await this.usagersService.findById(usagerId);
      const user = await this.usersService.findById(2);

      if (!user || !usager || usager === null) {
        throw new HttpException('Usager not found', HttpStatus.NOT_FOUND);
      }

      this.cerfaService.attestation(usager, user)
      .then(buffer => {
        res.setHeader('content-type', 'application/pdf');
        res.send(buffer);
      })
      .catch(err => {
        this.logger.log(err);
      });
    }

    /* DOCUMENT */
    @Delete('document/:usagerId/:index')
    public async deleteDocument(@Param('usagerId') usagerId: number, @Param('index') index: number) {
      return this.usagersService.deleteDocument(usagerId, index);
    }

    @Get('document/:usagerId/:index')
    public async getDocument(@Param('usagerId') usagerId: number, @Param('index') index: number, @Res() res) {

      this.usagersService.getDocument(usagerId, index)
      .then(fileInfos => {
        const pathFile = path.resolve(__dirname, '../../uploads/' + fileInfos.path);
        res.sendFile(pathFile);
      })
      .catch(err => {
        this.logger.log("ERROR");
        this.logger.log(err);
      });
    }

    @Post('document/:usagerId')
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: path.resolve(__dirname, '../../uploads'),
        fileFilter: (req: any, file: any, cb: any) => {
          const mimeTest = !file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/);
          const sizeTest = file.size >= 5242880;
          if (sizeTest || mimeTest) {
            throw new BadRequestException( {
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
          .join('');
          return cb(null, `${randomName}${path.extname(file.originalname)}`);
        },
      }),
    }))
    public uploadDoc(@Param('usagerId') usagerId: number, @UploadedFile() file, @Body() postData) {
      return this.usagersService.addDocument(usagerId, file.filename, file.mimetype, postData.label);
    }
  }
