import { HttpStatus } from "@nestjs/common";
import { Model } from "mongoose";
import { DatabaseModule, usersRepository } from "../database";
import { InteractionsModule } from "../interactions/interactions.module";
import { MailsModule } from "../mails/mails.module";
import { StatsModule } from "../stats/stats.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersController } from "../users/users.controller";
import { UsersModule } from "../users/users.module";
import { ExpressResponse } from "../util/express";
import { AppTestContext, AppTestHelper } from "../util/test";
import { AppUser } from "../_common/model";
import { StructuresController } from "./controllers/structures.controller";
import { StructuresService } from "./services/structures.service";
import { Structure } from "./structure-interface";

describe("Stuctures creation full", () => {
  let context: AppTestContext;
  let structureController: StructuresController;
  let userController: UsersController;
  let structureModel: Model<Structure>;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      controllers: [StructuresController],
      imports: [
        DatabaseModule,
        UsersModule,
        MailsModule,
        UsagersModule,
        InteractionsModule,
        StatsModule,
      ],
      providers: [{ provide: StructuresService, useValue: {} }],
    });
    structureController = context.module.get<StructuresController>(
      StructuresController
    );
    userController = context.module.get<UsersController>(UsersController);
    structureModel = context.module.get<Model<Structure>>("STRUCTURE_MODEL");
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", async () => {
    expect(structureController).toBeDefined();
    expect(userController).toBeDefined();
    expect(structureModel).toBeDefined();
  });

  const localCache: {
    preCreatedStructure?: Structure;
    createdStructure?: Structure;
    createdUser?: Partial<AppUser>;
  } = {};

  it("pre-create structure", async () => {
    // request 1: pre-create
    localCache.preCreatedStructure = await testPreCreateStructure();
  });

  it("create structure", async () => {
    // request 2: create structure
    localCache.createdStructure = await testCreateStructure(
      localCache.preCreatedStructure
    );
  });

  it("create user", async () => {
    // request 3: create user
    localCache.createdUser = await testCreateUser(localCache.createdStructure);
  });

  it("confirm structure", async () => {
    // request 4: confirm structure
    await testConfirmStructure({
      structureId: localCache.createdStructure.id,
      userId: localCache.createdUser.id,
    });
  });

  async function testCreateUser(structure: Structure) {
    const res = ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown) as ExpressResponse;
    const userMail = `admin-structure-${Math.random()}@cias-pessac.yopmail.com`;
    const response = await userController.create(
      {
        email: userMail,
        nom: "Smith",
        password: "Y67xc6D7XBibZ6r",
        prenom: "Ben",
        structureId: structure.id,
        phone: "0102030405",
        structure: undefined,
      },
      res
    );
    expect(response).toBeDefined();
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledTimes(1);

    const user = await usersRepository.findOne({
      email: userMail,
    });
    expect(user).toBeDefined();
    expect(user.verified).toBeFalsy();
    return user;
  }

  async function testCreateStructure(prePostStructure: Structure) {
    const structure = await structureController.postStructure(prePostStructure);
    expect(structure).toBeDefined();
    expect(structure.id).toBeDefined();
    return structure;
  }

  async function testPreCreateStructure() {
    const prePostData = {
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
    const prePostStructure: Structure = await structureController.prePostStructure(
      prePostData
    );
    expect(prePostStructure).toBeDefined();
    expect(prePostStructure.id).toBeUndefined();
    expect(prePostStructure.email).toEqual(prePostData.email);
    expect(prePostStructure.adresseCourrier.adresse).toEqual(
      prePostData.adresseCourrier.adresse
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
    const structure = await structureModel
      .findOne({
        id: structureId,
      })
      .select("id token");
    expect(structure).toBeDefined();
    expect(structure.id).toEqual(structureId);
    expect(structure.token).toBeDefined();
    const res = ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown) as ExpressResponse;

    await structureController.confirm(structure.token, `${structure._id}`, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledTimes(1);

    const userConfirmed = await usersRepository.findOne({
      id: userId,
    });
    expect(userConfirmed).toBeDefined();
    expect(userConfirmed.verified).toBeTruthy();
  }
});
