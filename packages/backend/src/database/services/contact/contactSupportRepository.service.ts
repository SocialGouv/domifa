import { myDataSource } from "..";
import { ContactSupportTable } from "../..";
import { ContactSupport } from "../../../_common/model";

export const contactSupportRepository =
  myDataSource.getRepository<ContactSupport>(ContactSupportTable);
