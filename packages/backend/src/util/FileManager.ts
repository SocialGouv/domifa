import * as fs from "fs";
import Sentry = require("@sentry/node");
import { HttpException, HttpStatus } from "@nestjs/common";

export async function deleteFile(pathFile: string) {
  if (fs.existsSync(pathFile)) {
    setTimeout(() => {
      try {
        fs.unlinkSync(pathFile);
      } catch (err) {
        Sentry.configureScope((scope) => {
          scope.setTag("file", pathFile);
        });

        throw new HttpException(
          { message: "CANNOT_DELETE_FILE" },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }, 2500);
  }
}
