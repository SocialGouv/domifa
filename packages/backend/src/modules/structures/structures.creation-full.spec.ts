import { HttpStatus } from "@nestjs/common";
import { userStructureRepository, structureRepository } from "../../database";
import { InteractionsModule } from "../interactions/interactions.module";
import { StatsModule } from "../stats/stats.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UserDto } from "../users/dto/user.dto";
import { UsersController } from "../users/controllers/users.controller";
import { UsersModule } from "../users/users.module";
import { ExpressResponse } from "../../util/express";
import { AppTestContext, AppTestHelper } from "../../util/test";

import { AdminStructuresDeleteController } from "../portail-admin/controllers/admin-structures-delete/admin-structures-delete.controller";
import { AdminStructuresController } from "../portail-admin/controllers/admin-structures/admin-structures.controller";
import { StructuresController } from "./controllers/structures.controller";
import { StructuresPublicController } from "./controllers/structures.public.controller";
import { StructureWithUserDto } from "./dto/structure-with-user.dto";
import { StructureDto } from "./dto/structure.dto";
import { structureDeletorService } from "./services/structure-deletor.service";
import { StructuresModule } from "./structure.module";
import { PortailAdminModule } from "../portail-admin";
import { MailsModule } from "../mails/mails.module";

const structureDto: StructureDto = {
  adresse: "1 rue de Pessac",
  adresseCourrier: {
    actif: false,
    adresse: "1 rue de Bordeaux",
    ville: "Bordeaux",
    codePostal: "33000",
  },
  organismeType: null,
  agrement: "",
  capacite: null,
  codePostal: "33600",
  complementAdresse: "",
  departement: "",
  email: `nouvelle-structure-${Math.random()}@cias-pessac.yopmail.com`,
  nom: "CIAS Pessac",
  telephone: {
    countryCode: "fr",
    numero: "0102030405",
  },
  responsable: { fonction: "sdf", nom: "sdf", prenom: "sdf" },
  structureType: "cias",
  ville: "sdfdsf",
  region: null,
  options: {
    numeroBoite: false,
    surnom: false,
  },
  acceptCgu: true,
  timeZone: "Europe/Paris",
  departmentName: "",
  regionName: "",
  reseau: null,
};

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
} as unknown as ExpressResponse;

describe("Stuctures creation full", () => {
  let context: AppTestContext;
  let structureController: StructuresController;
  let structurePublicController: StructuresPublicController;
  let adminStructuresController: AdminStructuresController;
  let adminStructuresDeleteController: AdminStructuresDeleteController;
  let userController: UsersController;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [],
      imports: [
        UsersModule,
        MailsModule,
        UsagersModule,
        InteractionsModule,
        StatsModule,
        StructuresModule,
        PortailAdminModule,
      ],
      providers: [],
    });
    structureController =
      context.module.get<StructuresController>(StructuresController);
    structurePublicController = context.module.get<StructuresPublicController>(
      StructuresPublicController
    );
    userController = context.module.get<UsersController>(UsersController);
    adminStructuresController = context.module.get<AdminStructuresController>(
      AdminStructuresController
    );
    adminStructuresDeleteController =
      context.module.get<AdminStructuresDeleteController>(
        AdminStructuresDeleteController
      );
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {
    expect(structurePublicController).toBeDefined();
    expect(structureController).toBeDefined();
    expect(userController).toBeDefined();
  });

  const localCache: {
    preCreatedStructure?: StructureDto;
    structureId?: number;
    userId?: number;
    uuid?: string;
  } = {};

  it("pre-create structure", async () => {
    // request 1: pre-create
    localCache.preCreatedStructure = await testPreCreateStructure();
  });

  it("create structure + user", async () => {
    // request 2: create structure
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const userMail = `admin-structure-${randomNumber}@cias-pessac.yopmail.com`;
    const userDto: UserDto = {
      email: userMail,
      nom: "Smith",
      password: "Y67xc6D7XBibZ6r",
      prenom: "Ben",
      structure: undefined,
    };
    const structureWithUser: StructureWithUserDto = {
      user: userDto,
      structure: structureDto,
    };

    await structurePublicController.postStructure(structureWithUser, res);
    const structure = await structureRepository.findOne({
      where: {
        email: structureDto.email,
      },
      order: {
        id: "desc",
      },
    });

    expect(structure).toBeDefined();
    expect(structure.nom).toEqual(structureDto.nom);
    expect(structure.lastLogin).toBeNull();
    expect(structure.verified).toBeFalsy();

    const user = await userStructureRepository.findOneBy({
      structureId: structure.id,
    });

    expect(user).toBeDefined();

    expect(user.prenom).toEqual(userDto.prenom);
    expect(user.nom).toEqual(userDto.nom);
    expect(user.structureId).toEqual(structure.id);
    expect(user.email).toEqual(userDto.email);
    expect(user.verified).toBeFalsy();

    localCache.structureId = structure.id;
    localCache.uuid = structure.uuid;
    localCache.userId = user.id;
  });

  it("confirm structure", async () => {
    // request 4: confirm structure
    const structure = await structureRepository.findOneBy({
      uuid: localCache.uuid,
    });

    await adminStructuresController.confirmStructureCreation(
      { token: structure.token, uuid: structure.uuid },
      res
    );

    expect(res.status).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledTimes(2);

    const userConfirmed = await userStructureRepository.findOneBy({
      id: localCache.userId,
    });

    expect(userConfirmed).toBeDefined();
    expect(userConfirmed.verified).toBeTruthy();
  });

  it("delete structure", async () => {
    const structure = await structureDeletorService.generateDeleteToken(
      localCache.uuid
    );

    await adminStructuresDeleteController.deleteStructureConfirm(res, {
      token: structure.token,
      uuid: structure.uuid,
    });
  });

  async function testPreCreateStructure() {
    const prePostStructure: StructureDto =
      structurePublicController.prePostStructure(structureDto);
    expect(prePostStructure).toBeDefined();
    expect(prePostStructure.email).toEqual(structureDto.email);
    expect(prePostStructure.adresseCourrier.adresse).toEqual(
      structureDto.adresseCourrier.adresse
    );
    return prePostStructure;
  }
});
