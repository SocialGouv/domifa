import { pgRepository } from "..";
import { ContactSupportTable } from "../..";
import { ContactSupport } from "../../../_common/model";

const baseRepository = pgRepository.get<ContactSupportTable, ContactSupport>(
  ContactSupportTable
);

export const contactSupportRepository = {
  ...baseRepository,
};
