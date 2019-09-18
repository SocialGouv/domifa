import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseModule } from "../../database/database.module";
import { UsersModule } from "../../users/users.module";
import { UsersService } from "../../users/users.service";
import { UsagersModule } from "../usagers.module";
import { DocumentsService } from "./documents.service";
import { UsagersService } from "./usagers.service";

describe("DocumentsService", () => {
  let service: DocumentsService;
  let userService: UsersService;
  let usagerService: UsagersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, UsersModule, UsagersModule],
      providers: [DocumentsService, UsersService, UsagersService]
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
    const usager = await usagerService.findById(3, user.structureId);
    const doc = await service.getDocument(usager, 0);
    expect(doc).toEqual({
      createdAt: new Date("2019-07-05T13:11:42.795Z"),
      createdBy: "Yassine",
      filetype: "image/jpeg",
      label: "Lettre d'identité",
      path: "1d94d21bb6e11d230a4b41c10a564102e2.jpg"
    });

    const docError = await service.getDocument(usager, 10);
    expect(docError).toBeNull();
  });
});
