import { Test, TestingModule } from "@nestjs/testing";
import { StructureDecisionService } from "./structure-decision.service";
import { FileManagerService } from "../../../../util";
import { MailsModule } from "../../../mails/mails.module";
import {
  messageSmsRepository,
  structureDocRepository,
  usagerDocsRepository,
  usagerHistoryStatesRepository,
  usagerRepository,
  userStructureRepository,
} from "../../../../database";
import { domifaConfig } from "../../../../config";

describe("StructureDecisionService", () => {
  let service: StructureDecisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StructureDecisionService, FileManagerService],
      imports: [MailsModule],
    }).compile();

    service = module.get<StructureDecisionService>(StructureDecisionService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("deleteStructureData", () => {
    it("deletes usager and structure documents from storage", async () => {
      jest.spyOn(userStructureRepository, "find").mockResolvedValue([]);
      const deleteFilesSpy = jest
        .spyOn(FileManagerService.prototype, "deleteAllUnderStructure")
        .mockResolvedValue(undefined);
      const repositories = [
        userStructureRepository,
        usagerDocsRepository,
        structureDocRepository,
        usagerRepository,
        messageSmsRepository,
        usagerHistoryStatesRepository,
      ];
      const deleteSpies = repositories.map((repository) =>
        jest.spyOn(repository, "delete").mockResolvedValue(undefined as any)
      );

      await service.deleteStructureData({
        id: 7,
        uuid: "6583c2671c304cc692368da8f3ed1154",
      });

      const root = domifaConfig().upload.bucketRootDir;
      expect(deleteFilesSpy).toHaveBeenCalledWith(
        `${root}/usager-documents/6583c2671c304cc692368da8f3ed1154/`
      );
      expect(deleteFilesSpy).toHaveBeenCalledWith(
        `${root}/structure-documents-encrypted/7/`
      );
      for (const spy of deleteSpies) {
        expect(spy).toHaveBeenCalledWith({ structureId: 7 });
      }
    });
  });
});
