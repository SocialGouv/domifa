import { myDataSource } from "..";
import { ContactSupportTable } from "../..";
import { ContactSupport } from "../../../modules/contact-support/ContactSupport.type";

export const contactSupportRepository =
  myDataSource.getRepository<ContactSupport>(ContactSupportTable);
