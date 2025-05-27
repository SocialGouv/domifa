import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "typeorm/platform/PlatformTools";
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
  ): Promise<string> {
    const mainSecret = domifaConfig().security.mainSecret;
    const readable = await this.getFileBody(filePath);

    const decryptedStream = readable.pipe(
      decryptFile(mainSecret, doc.encryptionContext)
    );

    const chunks: Uint8Array[] = [];

    for await (const chunk of decryptedStream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    return buffer.toString("binary");
  }

  public async dowloadEncryptedFile(
    res: Response,
    filePath: string,
    doc: CommonDoc
  ) {
    const mainSecret = domifaConfig().security.mainSecret;
    const body = await this.getFileBody(filePath);

    return body.pipe(decryptFile(mainSecret, doc.encryptionContext)).pipe(res);
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
}
