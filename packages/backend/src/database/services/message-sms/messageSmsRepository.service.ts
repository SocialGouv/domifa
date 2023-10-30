import { InteractionType } from "@domifa/common";
import { myDataSource } from "..";
import { MessageSms } from "../../../_common/model";
import { MessageSmsTable } from "./../../entities/message-sms/MessageSmsTable.typeorm";

export const messageSmsRepository = myDataSource
  .getRepository<MessageSms>(MessageSmsTable)
  .extend({
    async findSmsOnHold({
      usagerRef,
      structureId,
      interactionType,
    }: {
      usagerRef: number;
      structureId: number;
      interactionType: InteractionType;
    }): Promise<MessageSms> {
      return this.createQueryBuilder("message_sms")
        .where(
          `"interactionMetas"->>'interactionType' = :interactionType and status='TO_SEND' and "usagerRef"= :usagerRef and "structureId"=:structureId `,
          {
            usagerRef,
            structureId,
            interactionType,
          }
        )
        .getOne();
    },
  });
