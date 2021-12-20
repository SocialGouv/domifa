import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

import { appLogger } from "../../util";
import {
  Usager,
  UserStructureAuthenticated,
  CerfaDocType,
} from "../../_common/model";
import { getUsagerRef, generateCerfaDatas } from "../cerfa";

import pdftk = require("node-pdftk");

@Injectable()
export class CerfaService {
  public async attestation(
    usager: Usager,
    user: UserStructureAuthenticated,
    typeCerfa: CerfaDocType
  ) {
    const pdfForm =
      typeCerfa === "attestation"
        ? "../../_static/static-docs/attestation.pdf"
        : "../../_static/static-docs/demande.pdf";
    const usagerRef = getUsagerRef(usager);
    const pdfInfos = generateCerfaDatas(usager, user, typeCerfa);

    const filePath = path.resolve(__dirname, pdfForm);
    return pdftk
      .input(fs.readFileSync(filePath))
      .fillForm(pdfInfos)
      .output()
      .then((buffer: any) => {
        return buffer;
      })
      .catch((err) => {
        console.error(err);
        appLogger.error(
          `CERFA ERROR structure : ${user.structureId} / usager :${usagerRef} `,
          {
            sentry: true,
            extra: {
              filePath,
              ...pdfInfos,
            },
          }
        );
        throw new HttpException(
          {
            err,
            message: "CERFA_ERROR",
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });
  }
}
