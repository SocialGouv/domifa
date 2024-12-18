import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "typeorm/platform/PlatformTools";
import { domifaConfig } from "../../config";
import { Upload } from "@aws-sdk/lib-storage";
import { PassThrough } from "node:stream";
import { Injectable } from "@nestjs/common";
import { UsagerDoc } from "@domifa/common";
import { decryptFile } from "@socialgouv/streaming-file-encryption";
import { join } from "node:path";
import { Response } from "express";
import { cleanPath } from "./FileManager";
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
      forcePathStyle: true,
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
      console.error(e);
      throw new Error(e);
    }
  }

  // Return object in response
  public async downloadObject(filePath: string, res: Response) {
    try {
      const readObjectResult = await this.getObject(
        `${domifaConfig().upload.bucketRootDir}/${filePath}`
      );

      if (readObjectResult.CacheControl) {
        res.setHeader("cache-control", readObjectResult.CacheControl);
      }
      if (readObjectResult.ContentDisposition) {
        res.setHeader(
          "content-disposition",
          readObjectResult.ContentDisposition
        );
      }
      if (readObjectResult.ContentEncoding) {
        res.setHeader("content-encoding", readObjectResult.ContentEncoding);
      }
      if (readObjectResult.ContentLanguage) {
        res.setHeader("content-encoding", readObjectResult.ContentLanguage);
      }
      if (readObjectResult.ContentLength) {
        res.setHeader("content-length", readObjectResult.ContentLength);
      }
      if (readObjectResult.ContentRange) {
        res.setHeader("content-range", readObjectResult.ContentRange);
      }

      res.setHeader(
        "content-type",
        readObjectResult.ContentType || "application/octet-stream"
      );

      if (!(readObjectResult.Body instanceof Readable)) {
        appLogger.warn(`File ${filePath} is empty`);
        return res.status(204);
      }
      if (!readObjectResult.Body) {
        appLogger.error(`File ${filePath} is unreadable`);
        return res.status(500);
      }

      return readObjectResult.Body.pipe(res);
    } catch (err) {
      appLogger.error(err);
      return res.status(500).json({ message: "GET_FILE_ERROR" });
    }
  }

  // Return body for encrypted files
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
      console.error(e);
      throw new Error("CANNOT_DELETE_FILE");
    }
  }

  public async getObjectAndStream(filePath: string): Promise<string> {
    const readable = await this.getFileBody(filePath);

    const chunks: Uint8Array[] = [];

    for await (const chunk of readable) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    return buffer.toString("binary");
  }

  public async deleteAllUnderStructure(prefix: string) {
    const listParams = {
      Bucket: domifaConfig().upload.bucketName,
      Prefix: prefix,
    };

    const listedObjects = await this.s3.send(
      new ListObjectsV2Command(listParams)
    );

    if (listedObjects?.KeyCount === 0) {
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

  public async dowloadEncryptedFile(
    res: Response,
    structureUuid: string,
    usagerUuid: string,
    doc: UsagerDoc
  ) {
    const filePath = join(
      "usager-documents",
      cleanPath(structureUuid),
      cleanPath(usagerUuid),
      `${doc.path}.sfe`
    );

    const mainSecret = domifaConfig().security.mainSecret;
    const body = await this.getFileBody(filePath);

    return body.pipe(decryptFile(mainSecret, doc.encryptionContext)).pipe(res);
  }
}
