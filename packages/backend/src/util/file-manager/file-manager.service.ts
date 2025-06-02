import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { domifaConfig } from "../../config";
import { Upload } from "@aws-sdk/lib-storage";
import { PassThrough } from "node:stream";
import { pipeline } from "node:stream/promises";

import { Injectable } from "@nestjs/common";
import { CommonDoc } from "@domifa/common";
import {
  decryptFile,
  encryptFile,
} from "@socialgouv/streaming-file-encryption";
import { Response } from "express";
import { compressAndResizeImage } from "./FileManager";
import { appLogger } from "../logs";

@Injectable()
export class FileManagerService {
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: domifaConfig().upload.bucketEndpoint,
      credentials: {
        accessKeyId: domifaConfig().upload.bucketAccessKey,
        secretAccessKey: domifaConfig().upload.bucketSecretKey,
      },
      region: domifaConfig().upload.bucketRegion,
      forcePathStyle: domifaConfig().envId === "local" ? true : false,
    });
  }

  public async uploadFile(filePath: string, buffer: Buffer | PassThrough) {
    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: domifaConfig().upload.bucketName,
        Key: `${domifaConfig().upload.bucketRootDir}/${filePath}`,
        Body: buffer,
      },
    });

    try {
      await upload.done();
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  public async getObject(filePath: string) {
    try {
      return await this.s3.send(
        new GetObjectCommand({
          Bucket: domifaConfig().upload.bucketName,
          Key: filePath,
        })
      );
    } catch (e) {
      appLogger.error(e);
      throw new Error(e);
    }
  }

  public async getFileBody(path: string): Promise<Readable> {
    const { Body } = await this.getObject(
      `${domifaConfig().upload.bucketRootDir}/${path}`
    );
    if (Body instanceof Readable) {
      return Body;
    } else {
      throw new Error("Type de Body non pris en charge");
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: domifaConfig().upload.bucketName,
          Key: `${domifaConfig().upload.bucketRootDir}/${filePath}`,
        })
      );
    } catch (e) {
      appLogger.error(e);
      throw new Error("CANNOT_DELETE_FILE");
    }
  }

  public async deleteAllUnderStructure(prefix: string) {
    const listParams = {
      Bucket: domifaConfig().upload.bucketName,
      Prefix: prefix,
    };

    const listedObjects = await this.s3.send(
      new ListObjectsV2Command(listParams)
    );

    if (!listedObjects?.Contents?.length || listedObjects.KeyCount === 0) {
      console.log(`No documents for this structure: ${prefix}`);
      return;
    }

    const deleteParams = {
      Bucket: domifaConfig().upload.bucketName,
      Delete: {
        Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
      },
    };

    await this.s3.send(new DeleteObjectsCommand(deleteParams));

    if (listedObjects.IsTruncated) {
      await this.deleteAllUnderStructure(prefix);
    }
  }

  public async getDecryptedFileContent(
    filePath: string,
    doc: CommonDoc
  ): Promise<Buffer> {
    const mainSecret = domifaConfig().security.mainSecret;
    const readable = await this.getFileBody(filePath);
    const decryptedStream = readable.pipe(
      decryptFile(mainSecret, doc.encryptionContext)
    );

    const chunks: Buffer[] = [];
    let totalLength = 0;
    const maxSize = 50 * 1024 * 1024;

    try {
      for await (const chunk of decryptedStream) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

        if (totalLength + buffer.length > maxSize) {
          chunks.length = 0;
          throw new Error(`Max size ${maxSize} bytes`);
        }

        chunks.push(buffer);
        totalLength += buffer.length;
      }
      const finalBuffer = Buffer.concat(chunks, totalLength);
      chunks.length = 0;
      return finalBuffer;
    } catch (error) {
      chunks.length = 0;
      appLogger.error(`Decrypt fail ${filePath}:`, error.message);
      throw error;
    }
  }

  public async dowloadEncryptedFile(
    res: Response,
    filePath: string,
    doc: CommonDoc
  ) {
    const mainSecret = domifaConfig().security.mainSecret;
    console.log("mainSecret", mainSecret); // DEBUG IN PROGRESS

    try {
      res.setHeader("Content-Type", doc.filetype || "application/octet-stream");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      const body = await this.getFileBody(filePath);
      const decryptStream = decryptFile(mainSecret, doc.encryptionContext);

      await pipeline(body, decryptStream, res);

      appLogger.debug(`📤 File downloaded successfully: ${filePath}`);
    } catch (error) {
      appLogger.error(`❌ Download failed for ${filePath}: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({
          message: "DOWNLOAD_FAILED",
        });
      } else {
        res.destroy();
      }

      throw error;
    }
  }

  public async saveEncryptedFile(
    filePath: string,
    doc: Pick<CommonDoc, "filetype" | "encryptionContext">,
    source: Express.Multer.File | Readable
  ): Promise<void> {
    const passThrough = new PassThrough();
    const mainSecret = domifaConfig().security.mainSecret;
    const sourceStream =
      source instanceof Readable ? source : Readable.from(source.buffer);

    const uploadPromise = this.uploadFile(filePath, passThrough);
    let pipelinePromise: Promise<void>;

    if (doc.filetype === "image/jpeg" || doc.filetype === "image/png") {
      pipelinePromise = pipeline(
        sourceStream,
        compressAndResizeImage(doc),
        encryptFile(mainSecret, doc.encryptionContext),
        passThrough
      );
    } else {
      pipelinePromise = pipeline(
        sourceStream,
        encryptFile(mainSecret, doc.encryptionContext),
        passThrough
      );
    }

    await Promise.all([pipelinePromise, uploadPromise]);
  }

  public async fileExists(filePath: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: domifaConfig().upload.bucketName,
          Key: `${domifaConfig().upload.bucketRootDir}/${filePath}`,
        })
      );
      return true;
    } catch (error) {
      if (
        error.name === "NotFound" ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw error;
    }
  }

  public async getDecryptedFileStream(
    filePath: string,
    doc: Pick<CommonDoc, "encryptionContext">
  ): Promise<Readable> {
    const encryptedStream = await this.getFileBody(filePath);
    const mainSecret = domifaConfig().security.mainSecret;

    return encryptedStream.pipe(decryptFile(mainSecret, doc.encryptionContext));
  }

  public toNodeReadable(input: unknown): Readable {
    if (input instanceof Readable) {
      return input;
    }

    if (
      typeof input === "object" &&
      input !== null &&
      typeof (input as any).getReader === "function"
    ) {
      // Web ReadableStream
      return Readable.from(input as any);
    }

    if (Buffer.isBuffer(input)) {
      return Readable.from([input]);
    }

    if (input instanceof Uint8Array || input instanceof ArrayBuffer) {
      return Readable.from([Buffer.from(input as any)]);
    }

    if (typeof input === "string") {
      return Readable.from([Buffer.from(input)]);
    }

    throw new TypeError(
      `Unsupported input type for toNodeReadable: ${typeof input}`
    );
  }
}
