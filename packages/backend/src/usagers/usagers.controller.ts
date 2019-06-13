import { BadRequestException, Body, Controller, Delete, Get, Header, Logger, Param, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer';
import * as path from 'path';
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
    private readonly cerfaService: CerfaService)
    { }

    /* FORMULAIRE INFOS */
    @Post()
    public postUsager(@Body() usagerDto: UsagersDto) {
      return this.usagersService.create(usagerDto);
    }

    @Patch()
    public patchUsager(@Body() usagerDto: UsagersDto) {
      return this.usagersService.patch(usagerDto);
    }

    /* RDV  */
    @Post('rdv/:id')
    public postRdv(@Param('id') usagerId: number, @Body() rdvDto: RdvDto ) {
      return this.usagersService.setRdv(usagerId, rdvDto);
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
    @Header('Content-Type', 'application/pdf')
    public async getAttestation(@Param('id') usagerId: number, @Res() res) {

      const usager = await this.usagersService.findById(usagerId);

      this.cerfaService.attestation(usager)
      .then(buffer => {
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
        const pathFile = path.resolve(__dirname, '../uploads/' + fileInfos.path);
        res.sendFile(path.join(__dirname, '../uploads/' + fileInfos.path));
      })
      .catch(err => {
        this.logger.log("ERROR");
        this.logger.log(err);
      });
    }

    @Post('document/:usagerId')
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: 'src/uploads',
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
    public uploadDoc(@Param('usagerId') usagerId, @UploadedFile() file, @Body() postData) {
      return this.usagersService.addDocument(usagerId, file.filename, file.mimetype, postData.label);
    }
  }
