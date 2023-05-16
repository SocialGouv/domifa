import { appLogger } from "../../../../util";
import { contactSupportRepository } from "../../contact";

export const dataContactAnonymizer = {
  anonymizeContact,
};

async function anonymizeContact() {
  appLogger.warn(`[dataContactAnonymizer] Delete contact message`);
  await contactSupportRepository.delete({});
}
