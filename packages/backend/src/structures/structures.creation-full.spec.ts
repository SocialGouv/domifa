import { HttpStatus } from "@nestjs/common";
import { structureRepository, userStructureRepository } from "../database";
import { InteractionsModule } from "../interactions/interactions.module";
import { MailsModule } from "../mails/mails.module";
import { StatsModule } from "../stats/stats.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UserDto } from "../users/dto/user.dto";
import { UsersController } from "../users/users.controller";
import { UsersModule } from "../users/users.module";
import { ExpressResponse } from "../util/express";
import { AppTestContext, AppTestHelper } from "../util/test";
import { UserStructure } from "../_common/model";
import { StructuresController } from "./controllers/structures.controller";
import { StructuresPublicController } from "./controllers/structures.public.controller";
import { StructureWithUserDto } from "./dto/structure-with-user.dto";
import { StructureDto } from "./dto/structure.dto";
import { structureDeletorService } from "./services/structureDeletor.service";
import { StructuresModule } from "./structure.module";

const structureDto: StructureDto = {
  adresse: "1 rue de Pessac",
  adresseCourrier: {
    actif: false,
    adresse: "1 rue de Bordeaux",
    ville: "Bordeaux",
    codePostal: "33000",
  },
  agrement: "",
  capacite: null,
  codePostal: "33600",
  complementAdresse: "",
  departement: "",
  email: `nouvelle-structure-${Math.random()}@cias-pessac.yopmail.com`,
  nom: "CIAS Pessac",
  phone: "0102030405",
  responsable: { fonction: "sdf", nom: "sdf", prenom: "sdf" },
  structureType: "cias",
  ville: "sdfdsf",
};
describe("Stuctures creation full", () => {
  let context: AppTestContext;
  let structureController: StructuresController;
  let structurePublicController: StructuresPublicController;
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
      ],
      providers: [],
    });
    structureController =
      context.module.get<StructuresController>(StructuresController);
    structurePublicController = context.module.get<StructuresPublicController>(
      StructuresPublicController
    );
    userController = context.module.get<UsersController>(UsersController);
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
  } = {};

  it("pre-create structure", async () => {
    // request 1: pre-create
    localCache.preCreatedStructure = await testPreCreateStructure();
  });

  it("create structure + user", async () => {
    // request 2: create structure
    const { structureId, userId } = await testCreateStructure();
    localCache.structureId = structureId;
    localCache.userId = userId;
  });

  it("confirm structure", async () => {
    // request 4: confirm structure
    await testConfirmStructure({
      structureId: localCache.structureId,
      userId: localCache.userId,
    });
  });

  it("delete structure", async () => {
    // DELETE
    const structure = await structureDeletorService.generateDeleteToken(
      localCache.structureId
    );

    await structureController.deleteOne(
      "" + structure.id,
      structure.token,
      structure.nom
    );
  });

  async function testCreateStructure() {
    const userMail = `admin-structure-${Math.random()}@cias-pessac.yopmail.com`;
    const userDto: UserDto = {
      email: userMail,
      nom: "Smith",
      password: "Y67xc6D7XBibZ6r",
      prenom: "Ben",
      phone: "0102030405",
      structure: undefined,
    };
    const structureWithUser: StructureWithUserDto = {
      user: userDto,
      structure: structureDto,
    };
    const { structureId, userId } =
      await structurePublicController.postStructure(structureWithUser);
    expect(structureId).toBeDefined();
    expect(userId).toBeDefined();
    const structure = await structureRepository.findOne<UserStructure>(
      {
        id: structureId,
      },
      { select: "ALL" }
    );
    expect(structure).toBeDefined();
    expect(structure.nom).toEqual(structureDto.nom);
    expect(structure.lastLogin).toBeNull();
    expect(structure.verified).toBeFalsy();

    const user = await userStructureRepository.findOne<UserStructure>(
      {
        id: userId,
      },
      { select: "ALL" }
    );
    expect(user).toBeDefined();

    expect(user.prenom).toEqual(userDto.prenom);
    expect(user.nom).toEqual(userDto.nom);
    expect(user.structureId).toEqual(structureId);
    expect(user.email).toEqual(userDto.email);
    expect(user.verified).toBeFalsy();

    return { structureId, userId };
  }

  async function testPreCreateStructure() {
    const prePostStructure: StructureDto =
      await structurePublicController.prePostStructure(structureDto);
    expect(prePostStructure).toBeDefined();
    expect(prePostStructure.email).toEqual(structureDto.email);
    expect(prePostStructure.adresseCourrier.adresse).toEqual(
      structureDto.adresseCourrier.adresse
    );
    return prePostStructure;
  }

  async function testConfirmStructure({
    structureId,
    userId,
  }: {
    structureId: number;
    userId: number;
  }) {
    const structure = await structureRepository.findOne({
      id: structureId,
    });
    expect(structure).toBeDefined();
    expect(structure.id).toEqual(structureId);
    expect(structure.token).toBeDefined();
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as ExpressResponse;
    await structurePublicController.confirmStructureCreation(
      structure.token,
      `${structure.id}`,
      res
    );
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledTimes(1);

    const userConfirmed = await userStructureRepository.findOne({
      id: userId,
    });
    expect(userConfirmed).toBeDefined();
    expect(userConfirmed.verified).toBeTruthy();
  }
});
