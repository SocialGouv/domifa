import { myDataSource } from "..";
import { MessageSms, InteractionType } from "../../../_common/model";
import { MessageSmsTable } from "./../../entities/message-sms/MessageSmsTable.typeorm";

export const messageSmsRepository = myDataSource
  .getRepository<MessageSms>(MessageSmsTable)
  .extend({
    findSmsOnHold,
  });

async function findSmsOnHold({
  usagerRef,
  structureId,
  interactionType,
}: {
  usagerRef: number;
  structureId: number;
  interactionType: InteractionType;
}): Promise<MessageSms> {
  return messageSmsRepository
    .createQueryBuilder("interactions")
    .where(
      `"interactionMetas"->>'interactionType' = :interactionType and status='TO_SEND' and "usagerRef"= :usagerRef and "structureId"=:structureId `,
      {
        usagerRef,
        structureId,
        interactionType,
      }
    )
    .getOne();
}
