import {
  Controller,
  HttpStatus,
  INestApplication,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { readFileSync } from "fs";
import { resolve } from "path";
import request from "supertest";

import { AntivirusFileInterceptor } from "./antivirus-file.interceptor";
import { AntivirusService } from "./antivirus.service";
import { AntivirusUnavailableError } from "./AntivirusUnavailableError";

jest.mock("./antivirus.service", () => ({
  AntivirusService: class MockAntivirusService {},
}));

const handler = jest.fn();

const XLSX_CONTENT = readFileSync(
  resolve(__dirname, "../../_static/usagers-import-test/import_ok_1.xlsx")
);

@Controller("upload")
class UploadTestController {
  @Post()
  @UseInterceptors(
    AntivirusFileInterceptor(
      "file",
      ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      { limits: { fileSize: 100 * 1024 } }
    )
  )
  public upload(@UploadedFile() file: Express.Multer.File) {
    handler(file);
    return { size: file.buffer.length };
  }
}

describe("AntivirusFileInterceptor", () => {
  let app: INestApplication;
  const scanBuffer = jest.fn();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UploadTestController],
      providers: [{ provide: AntivirusService, useValue: { scanBuffer } }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    handler.mockReset();
    scanBuffer.mockReset();
  });

  it("passes a clean file to the handler", async () => {
    scanBuffer.mockResolvedValue({ isInfected: false });

    const response = await request(app.getHttpServer())
      .post("/upload")
      .attach("file", XLSX_CONTENT, "import.xlsx");

    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual({ size: XLSX_CONTENT.length });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("returns 422 FILE_INFECTED without calling the handler", async () => {
    scanBuffer.mockResolvedValue({ isInfected: true, viruses: ["Eicar"] });

    const response = await request(app.getHttpServer())
      .post("/upload")
      .attach("file", XLSX_CONTENT, "import.xlsx");

    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(response.body.message).toBe("FILE_INFECTED");
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns 503 ANTIVIRUS_UNAVAILABLE without calling the handler", async () => {
    scanBuffer.mockRejectedValue(new AntivirusUnavailableError());

    const response = await request(app.getHttpServer())
      .post("/upload")
      .attach("file", XLSX_CONTENT, "import.xlsx");

    expect(response.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(response.body.message).toBe("ANTIVIRUS_UNAVAILABLE");
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns 400 INCORRECT_FORMAT for a disallowed content type, without scanning it", async () => {
    const response = await request(app.getHttpServer())
      .post("/upload")
      .attach("file", Buffer.from("nom;prenom"), "import.xlsx");

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toBe("INCORRECT_FORMAT");
    expect(scanBuffer).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns 413 for a file over the size limit, without scanning it", async () => {
    const response = await request(app.getHttpServer())
      .post("/upload")
      .attach("file", Buffer.alloc(200 * 1024), "import.xlsx");

    expect(response.status).toBe(HttpStatus.PAYLOAD_TOO_LARGE);
    expect(scanBuffer).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });
});
