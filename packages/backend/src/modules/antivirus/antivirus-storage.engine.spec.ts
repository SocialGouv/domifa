import {
  BadRequestException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { readFileSync } from "fs";
import { StorageEngine } from "multer";
import { PassThrough } from "node:stream";
import { resolve } from "path";

import { ExpressRequest } from "../../util/express";
import { AntivirusService } from "./antivirus.service";
import { AntivirusStorageEngine } from "./antivirus-storage.engine";
import { AntivirusUnavailableError } from "./AntivirusUnavailableError";

jest.mock("./antivirus.service", () => ({
  AntivirusService: class MockAntivirusService {},
}));

const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const XLSX_CONTENT = readFileSync(
  resolve(__dirname, "../../_static/usagers-import-test/import_ok_1.xlsx")
);

function buildFile(
  content: Buffer = XLSX_CONTENT,
  truncated = false
): Express.Multer.File {
  const stream = Object.assign(new PassThrough(), { truncated });
  setImmediate(() => stream.end(content));
  return {
    fieldname: "file",
    originalname: "import.xlsx",
    mimetype: XLSX_MIME_TYPE,
    stream,
  } as unknown as Express.Multer.File;
}

function handleFile(
  engine: AntivirusStorageEngine,
  file: Express.Multer.File
): Promise<{ error?: unknown; info?: Partial<Express.Multer.File> }> {
  return new Promise((resolve) => {
    engine._handleFile({} as ExpressRequest, file, (error, info) =>
      resolve({ error, info })
    );
  });
}

describe("AntivirusStorageEngine", () => {
  let scanBuffer: jest.Mock;
  let innerHandleFile: jest.Mock;
  let engine: AntivirusStorageEngine;

  beforeEach(() => {
    scanBuffer = jest.fn();
    innerHandleFile = jest.fn((_req, file, callback) => {
      const chunks: Buffer[] = [];
      file.stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      file.stream.on("end", () =>
        callback(null, { buffer: Buffer.concat(chunks) })
      );
    });
    const innerStorage = {
      _handleFile: innerHandleFile,
      _removeFile: jest.fn(),
    } as unknown as StorageEngine;

    engine = new AntivirusStorageEngine(
      { scanBuffer } as unknown as AntivirusService,
      innerStorage,
      [XLSX_MIME_TYPE]
    );
  });

  it("hands a clean file to the wrapped storage", async () => {
    scanBuffer.mockResolvedValue({ isInfected: false });

    const { error, info } = await handleFile(engine, buildFile());

    expect(error).toBeNull();
    expect(scanBuffer).toHaveBeenCalledWith(XLSX_CONTENT);
    expect(info?.buffer).toEqual(XLSX_CONTENT);
  });

  it("rejects a file whose content is not an allowed type, before scanning it", async () => {
    const { error } = await handleFile(
      engine,
      buildFile(Buffer.from("nom;prenom\nDupont;Jean\n"))
    );

    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).getResponse()).toEqual({
      message: "INCORRECT_FORMAT",
    });
    expect(scanBuffer).not.toHaveBeenCalled();
    expect(innerHandleFile).not.toHaveBeenCalled();
  });

  it("rejects an infected file before it reaches the storage", async () => {
    scanBuffer.mockResolvedValue({
      isInfected: true,
      viruses: ["Eicar-Test-Signature"],
    });

    const { error } = await handleFile(engine, buildFile());

    expect(error).toBeInstanceOf(UnprocessableEntityException);
    expect((error as UnprocessableEntityException).getResponse()).toEqual({
      message: "FILE_INFECTED",
    });
    expect(innerHandleFile).not.toHaveBeenCalled();
  });

  it("rejects the file when the antivirus is unavailable", async () => {
    scanBuffer.mockRejectedValue(new AntivirusUnavailableError());

    const { error } = await handleFile(engine, buildFile());

    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as ServiceUnavailableException).getResponse()).toEqual({
      message: "ANTIVIRUS_UNAVAILABLE",
    });
    expect(innerHandleFile).not.toHaveBeenCalled();
  });

  it("does not scan a file truncated by the size limit", async () => {
    const { error } = await handleFile(engine, buildFile(XLSX_CONTENT, true));

    expect(error).toBeInstanceOf(Error);
    expect(scanBuffer).not.toHaveBeenCalled();
    expect(innerHandleFile).not.toHaveBeenCalled();
  });
});
