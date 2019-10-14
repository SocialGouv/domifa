import { forwardRef } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../../database/database.module";
import { UsersModule } from "../../users/users.module";
import { UsersService } from "../../users/users.service";
import { UsagersProviders } from "../usagers.providers";
import { CerfaService } from "./cerfa.service";
import { DocumentsService } from "./documents.service";
import { UsagersService } from "./usagers.service";

describe("DocumentsService", () => {
  let service: DocumentsService;
  let userService: UsersService;
  let usagerService: UsagersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, forwardRef(() => UsersModule)],
      providers: [
        UsagersService,
        CerfaService,
        DocumentsService,
        ...UsagersProviders
      ]
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    userService = module.get<UsersService>(UsersService);
    usagerService = module.get<UsagersService>(UsagersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("2. Document Functions 📁 ", async () => {
    const user = await userService.findOne({ id: 1 });
    const usager = await usagerService.findById(1, user.structureId, "true");
    const doc = await service.getDocument(usager, 0);
    expect(doc).toEqual({
      createdAt: new Date("2019-10-07T18:51:31.578Z"),
      createdBy: "Patrick Roméro",
      filetype: "image/jpeg",
      label: "CNI",
      path: "373144a3d9d0b3f4c84bd527a5cff880.jpg"
    });

    const docError = await service.getDocument(usager, 10);
    expect(docError).toBeNull();
  });
});
