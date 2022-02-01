import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

import { appLogger } from "../../util";
import {
  Usager,
  UserStructureAuthenticated,
  CerfaDocType,
} from "../../_common/model";
import { generateCerfaDatas } from "../cerfa";

import pdftk = require("node-pdftk");

@Injectable()
export class CerfaService {
  public async attestation(
    usager: Usager,
    user: UserStructureAuthenticated,
    typeCerfa: CerfaDocType
  ): Promise<Buffer> {
    const pdfForm =
      typeCerfa === "attestation"
        ? "../../_static/static-docs/attestation.pdf"
        : "../../_static/static-docs/demande.pdf";

    const pdfInfos = generateCerfaDatas(usager, user, typeCerfa);

    const filePath = path.resolve(__dirname, pdfForm);
    return pdftk.input(fs.readFileSync(filePath)).fillForm(pdfInfos).output();
  }
}
