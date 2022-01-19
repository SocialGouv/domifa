import { ContactSupport } from "../../../_common/model/contact/ContactMessage.type";
import { ContactSupportTable } from "../../entities/contact-support/ContactSupportTable.typeorm";
import { pgRepository } from "..";

const baseRepository = pgRepository.get<ContactSupportTable, ContactSupport>(
  ContactSupportTable
);

export const contactSupportRepository = {
  ...baseRepository,
};
