import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "typeorm/platform/PlatformTools";
import { appLogger } from "../AppLogger.service";
import { domifaConfig } from "../../config";
import { Upload } from "@aws-sdk/lib-storage";
import { PassThrough } from "node:stream";
import { ExpressResponse } from "../express";
import { Injectable } from "@nestjs/common";

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
      const uploadResult = await upload.done();
      console.log("done uploading", uploadResult);
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
  public async downloadObject(filePath: string, res: ExpressResponse) {
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
      if (err.Code && err.Code === "NoSuchKey") {
        return res.status(404);
      }
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

  public async deleteAllUnderStructure(prefix: string) {
    const listParams = {
      Bucket: domifaConfig().upload.bucketName,
      Prefix: prefix,
    };

    console.log({ listParams });
    const listedObjects = await this.s3.send(
      new ListObjectsV2Command(listParams)
    );

    if (listedObjects.Contents.length === 0) return;

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
}
