import { ContactSupportDto } from "./contact.dto";

import { Injectable } from "@nestjs/common";
import { ContactSupport } from "../../_common/model";
import { contactSupportRepository } from "../../database";

@Injectable()
export class ContactSupportService {
  public async create(
    contactSupportDto: ContactSupportDto
  ): Promise<ContactSupport> {
    contactSupportDto.status = "ON_HOLD";
    return await contactSupportRepository.save(contactSupportDto);
  }
}
