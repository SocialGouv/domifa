import { Test, TestingModule } from "@nestjs/testing";
import * as mongoose from "mongoose";
import { DatabaseModule } from "../../database/database.module";
import { UsersModule } from "../../users/users.module";
import { UsagersDto } from "../dto/usagers.dto";
import { Usager } from "../interfaces/usagers";
import { UsagerSchema } from "../usager.schema";
import { UsagersProviders } from "../usagers.providers";
import { CerfaService } from "./cerfa.service";
import { UsagersService } from "./usagers.service";

describe("UsagersService", () => {
  let service: UsagersService;
  const fakeUsagerDto = new UsagersDto();

  fakeUsagerDto.nom = "Mamadou";
  fakeUsagerDto.prenom = "niang";
  fakeUsagerDto.surnom = "chips";
  fakeUsagerDto.dateNaissance = new Date();
  fakeUsagerDto.villeNaissance = "chips";
  fakeUsagerDto.etapeDemande = 2;
  fakeUsagerDto.email = "chips@gmail.com";

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, UsersModule],
      providers: [UsagersService, CerfaService, ...UsagersProviders]
    }).compile();

    service = module.get<UsagersService>(UsagersService);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("0. CREATE PATCH", async () => {
    expect(service.create(fakeUsagerDto)).toBeDefined();
    expect(service.create(fakeUsagerDto)).toBeTruthy();

    fakeUsagerDto.id = 1;
    expect(service.patch(fakeUsagerDto)).toBeTruthy();

    console.log(await service.patch(fakeUsagerDto));
  });

  it("1. Mongoose request", async () => {
    expect(service.findAll()).toBeTruthy();
  });

  it("1. Mongoose request", async () => {
    expect(service.findAll()).toBeDefined();
    expect(service.findLastUsager()).toBeDefined();
    expect(service.lastId(await service.findById(1))).toBeDefined();
  });
});
