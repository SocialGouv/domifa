import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import pdftk = require('node-pdftk');
import * as path from 'path';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../../users/users.module';
import { UsagersProviders } from '../usagers.providers';
import { CerfaService } from './cerfa.service';
import { UsagersService } from './usagers.service';

describe('CerfaService', () => {
  let service: CerfaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ DatabaseModule, UsersModule ],
      providers: [ UsagersService, CerfaService, ...UsagersProviders ],
    }).compile();

    service = module.get<CerfaService>(CerfaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('LOAD PDF FILES', () => {
    const pdfForm1 = '../../ressources/demande.pdf';
    expect(fs.existsSync(path.resolve(__dirname, pdfForm1))).toBe(true);
  });


  it('LOAD PDF FILES', () => {
    const pdfForm2 = '../../ressources/attestation.pdf';
    expect(fs.existsSync(path.resolve(__dirname, pdfForm2))).toBe(true);
  });



});
