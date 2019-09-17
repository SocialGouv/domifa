import { Test, TestingModule } from "@nestjs/testing";
import { DocumentsService } from "./documents.service";

describe("DocumentsService", () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentsService]
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("2. Document Functions 📁 ", async () => {
    const doc = await service.getDocument(3, 0);
    expect(doc).toEqual({
      createdAt: new Date("2019-07-05T13:11:42.795Z"),
      createdBy: "Yassine",
      filetype: "image/jpeg",
      label: "Lettre d'identité",
      path: "1d94d21bb6e11d230a4b41c10a564102e2.jpg"
    });

    const docError = await service.getDocument(3, 10);
    expect(docError).toBeNull();
  });
});
