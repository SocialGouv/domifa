import {
  ServiceUnavailableException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { AntivirusErrorCode } from "@domifa/common";
import { StorageEngine } from "multer";
import { Readable } from "node:stream";

import { UserStructureAuthenticated } from "../../_common/model";
import { appLogger } from "../../util";
import { ExpressRequest } from "../../util/express";
import { AntivirusService } from "./antivirus.service";
import { AntivirusScanResult } from "./antivirus.types";

type StorageCallback = (
  error?: unknown,
  info?: Partial<Express.Multer.File>
) => void;

// Buffers the upload in memory and only hands it to the wrapped storage once
// clamd reports it clean: nothing is written to disk or S3 before the verdict.
export class AntivirusStorageEngine implements StorageEngine {
  constructor(
    private readonly antivirusService: AntivirusService,
    private readonly storage: StorageEngine
  ) {}

  public _handleFile(
    req: ExpressRequest,
    file: Express.Multer.File,
    callback: StorageCallback
  ): void {
    const chunks: Buffer[] = [];

    file.stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    file.stream.once("error", (error) => callback(error));
    file.stream.once("end", () => {
      void this.scanAndStore(req, file, Buffer.concat(chunks), callback);
    });
  }

  public _removeFile(
    req: ExpressRequest,
    file: Express.Multer.File,
    callback: (error: Error | null) => void
  ): void {
    this.storage._removeFile(req, file, callback);
  }

  private async scanAndStore(
    req: ExpressRequest,
    file: Express.Multer.File,
    buffer: Buffer,
    callback: StorageCallback
  ): Promise<void> {
    // Multer already rejects the request with LIMIT_FILE_SIZE
    if ((file.stream as Readable & { truncated?: boolean }).truncated) {
      return callback(new Error("File truncated"));
    }

    const user = req.user as UserStructureAuthenticated | undefined;
    const context = {
      userId: user?.id,
      structureId: user?.structureId,
      mimetype: file.mimetype,
      size: buffer.length,
    };

    let result: AntivirusScanResult;
    try {
      result = await this.antivirusService.scanBuffer(buffer);
    } catch (error) {
      appLogger.error("[ANTIVIRUS] Scan unavailable", {
        sentry: true,
        error,
        context,
      });
      return callback(
        new ServiceUnavailableException({
          message: "ANTIVIRUS_UNAVAILABLE" satisfies AntivirusErrorCode,
        })
      );
    }

    if (result.isInfected) {
      appLogger.error("[ANTIVIRUS] Infected file rejected", {
        sentry: true,
        context: { ...context, viruses: result.viruses },
      });
      return callback(
        new UnprocessableEntityException({
          message: "FILE_INFECTED" satisfies AntivirusErrorCode,
        })
      );
    }

    this.storage._handleFile(
      req,
      { ...file, stream: Readable.from([buffer]) },
      callback
    );
  }
}
