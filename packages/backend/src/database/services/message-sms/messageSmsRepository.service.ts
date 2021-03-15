import { AppUser } from "../../../_common/model";
import { InteractionType } from "../../../_common/model/interaction";
import { MessageSms } from "../../../_common/model/message-sms";
import { UsagerLight } from "../../entities";
import { MessageSmsTable } from "../../entities/message-sms/MessageSmsTable.typeorm";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<MessageSmsTable, MessageSms>(
  MessageSmsTable
);

export const messageSmsRepository = {
  ...baseRepository,
  findSmsOnHold,
};

async function findSmsOnHold({
  usager,
  user,
  sendDate,
  interactionType,
}: {
  usager: Pick<UsagerLight, "ref">;
  user: Pick<AppUser, "structureId">;
  sendDate: Date;
  interactionType: InteractionType;
}): Promise<MessageSms> {
  return messageSmsRepository.findOneWithQuery<MessageSms>({
    where: `"interactionMetas"->>'interactionType' = :interactionType and
    status='TO_SEND' and
    "usagerRef"= :usagerRef and
    "structureId"=:structureId and
    "sendDate"::timestamptz <= :sendDate`,
    params: {
      usagerRef: usager.ref,
      structureId: user.structureId,
      sendDate,
      interactionType,
    },
  });
}
